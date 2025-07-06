export function PropertyMap({
  properties,
  onSelectProperty,
  showCurrentLocation = true,
  showRadiusCircle = true,
  height = '500px',
  className = '',
}: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const propertyContext = useContext(PropertyContext);
  const isPremium = propertyContext?.isPremium || false;
  const searchRadius = propertyContext?.searchRadius || 5;
  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    // Libraries needed for additional functionality
    libraries: ['places', 'geometry'],
  });

  // Map center state (defaults to Hyderabad, can be updated to user location)
  const [center, setCenter] = useState(defaultCenter);

  // Update center when location is available
  useEffect(() => {
    if (location && showCurrentLocation) {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location, showCurrentLocation]);

  // Handle property selection
  const handlePropertySelect = useCallback(
    (property: Property) => {
      setSelectedProperty(property);
      if (onSelectProperty) {
        onSelectProperty(property);
      }
    },
    [onSelectProperty]
  );

  // Fit bounds to include all properties
  const fitBoundsToProperties = useCallback(() => {
    if (!map || properties.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    properties.forEach((property) => {
      if (property.lat && property.lng) {
        bounds.extend({ lat: property.lat, lng: property.lng });
      }
    });

    // If user location is available, include it in bounds
    if (location) {
      bounds.extend({ lat: location.lat, lng: location.lng });
    }

    if (map) {
      map.fitBounds(bounds);
    }

    // Don't zoom in too far
    if (map) {
      const currentMap = map;
      const listener = google.maps.event.addListener(currentMap, 'idle', () => {
        const zoom = currentMap.getZoom();
        if (zoom && zoom > 15) currentMap.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, properties, location]);

  // Fit bounds when map or properties change
  useEffect(() => {
    if (isLoaded && !loadError && map && properties.length > 0) {
      fitBoundsToProperties();
    }
  }, [isLoaded, loadError, map, properties, fitBoundsToProperties]);

  // Center map on current location
  const centerOnUserLocation = useCallback(() => {
    if (location && map) {
      map.panTo({ lat: location.lat, lng: location.lng });
      map.setZoom(14);
    }
  }, [location, map]);

  // Set radius based on premium status
  const radius = useMemo(() => searchRadius * 1000, [searchRadius]); // Convert km to meters

  // Get circle options
  const circleOptions = useMemo(() => ({
    strokeColor: isPremium ? '#8b5cf6' : '#3b82f6',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: isPremium ? '#a78bfa' : '#93c5fd',
    fillOpacity: 0.1,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    zIndex: 1,
  }), [isPremium]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 rounded-md ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <p className="text-destructive font-medium mb-2">Failed to load Google Maps</p>
          <p className="text-muted-foreground text-sm">Please check your internet connection or try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 rounded-md ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
        onLoad={setMap}
      >
        {/* Property markers */}
        {properties.map((property) => (
          property.lat && property.lng ? (
            <Marker
              key={property.id}
              position={{ lat: property.lat, lng: property.lng }}
              icon={getMarkerIcon(property.status)}
              onClick={() => handlePropertySelect(property)}
              title={property.location}
            />
          ) : null
        ))}

        {/* Current location marker */}
        {location && showCurrentLocation && (
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            icon={{
              path: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
              fillColor: '#6366f1',
              fillOpacity: 1,
              strokeWeight: 0,
              rotation: 0,
              scale: 1.3,
              anchor: new google.maps.Point(12, 12),
            }}
          />
        )}

        {/* Search radius circle */}
        {location && showRadiusCircle && (
          <Circle
            center={{ lat: location.lat, lng: location.lng }}
            radius={radius}
            options={circleOptions}
          />
        )}

        {/* Info window for selected property */}
        {selectedProperty && (
          <InfoWindow
            position={{ 
              lat: selectedProperty.lat || defaultCenter.lat, 
              lng: selectedProperty.lng || defaultCenter.lng 
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="p-1 max-w-xs">
              <h3 className="font-semibold text-sm">{selectedProperty.location}</h3>
              <div className="flex gap-1 mt-1 mb-1">
                <Badge variant={selectedProperty.status === 'vacant' ? 'default' : 
                  selectedProperty.status === 'trending' ? 'secondary' : 'destructive'}>
                  {selectedProperty.status.charAt(0).toUpperCase() + selectedProperty.status.slice(1)}
                </Badge>
                {selectedProperty.type && (
                  <Badge variant="outline">{selectedProperty.type}</Badge>
                )}
                {selectedProperty.bhk && (
                  <Badge variant="outline">{selectedProperty.bhk} BHK</Badge>
                )}
              </div>
              {selectedProperty.price && (
                <p className="text-xs mt-1">
                  <span className="font-medium">Price:</span> {formatCurrency(selectedProperty.price)}
                </p>
              )}
              {selectedProperty.rent && (
                <p className="text-xs mt-1">
                  <span className="font-medium">Rent:</span> {formatCurrency(selectedProperty.rent)}/month
                </p>
              )}
              {selectedProperty.size && (
                <p className="text-xs mt-1">
                  <span className="font-medium">Area:</span> {selectedProperty.size} sq.ft
                </p>
              )}
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full mt-2 text-xs py-1"
                onClick={() => {
                  if (onSelectProperty) onSelectProperty(selectedProperty);
                  setSelectedProperty(null);
                }}
              >
                View Details
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Controls Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 z-10 shadow-md h-9 w-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200"
          >
            <MoreVertical className="h-5 w-5 text-gray-700" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 shadow-lg border-gray-200 rounded-xl" align="end" sideOffset={5}>
          <div className="p-3 border-b bg-gray-50">
            <h4 className="text-sm font-medium">Map Controls</h4>
            <p className="text-xs text-muted-foreground mt-1">Property status and location options</p>
          </div>
          
          {/* Legend in Popover */}
          <div className="px-3 py-3 border-b">
            <div className="text-xs font-semibold mb-2">Property Status</div>
            <div className="grid gap-2 text-xs">
              <div className="flex items-center py-1">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2.5 flex-shrink-0"></span>
                <span>Vacant</span>
              </div>
              <div className="flex items-center py-1">
                <span className="h-3 w-3 rounded-full bg-red-500 mr-2.5 flex-shrink-0"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center py-1">
                <span className="h-3 w-3 rounded-full bg-blue-500 mr-2.5 flex-shrink-0"></span>
                <span>Trending</span>
              </div>
              {isPremium && (
                <div className="flex items-center py-1">
                  <span className="h-3 w-3 rounded-full border-2 border-purple-400 bg-purple-100/50 mr-2.5 flex-shrink-0"></span>
                  <span>Premium Search Radius ({searchRadius}km)</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Location Controls in Popover */}
          <div className="p-3">
            {showCurrentLocation && (
              <Button
                size="sm"
                variant="default"
                className="w-full"
                onClick={() => {
                  centerOnUserLocation();
                }}
                disabled={!location || locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Navigation className="h-4 w-4 mr-1.5" />
                )}
                <span className="text-xs">Center on My Location</span>
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}