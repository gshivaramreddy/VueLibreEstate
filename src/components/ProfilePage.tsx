(Mobile-Responsive Profile Page)

 

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  User, 
  Home, 
  Settings, 
  Star, 
  Upload, 
  LogOut, 
  Camera, 
  Crown,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Clock,
  Users
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { PremiumFeatureModal } from '@/components/premium/PremiumModal';
import { toast } from '@/hooks/use-toast';
import { Property } from '@/types';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Separator } from '@/components/ui/separator';
import { queryClient } from '@/lib/queryClient';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type ProfileTab = 'overview' | 'saved' | 'listings' | 'settings';

export default function ProfilePage() {
  const { user, loading, updateProfile, logout, uploadProfileImage } = useUser();
  const { isPremium, upgradeToPremiun } = usePropertyContext();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [userListedProperties, setUserListedProperties] = useState<Property[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Profile edit form schema
  const profileFormSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(10).max(15).optional().or(z.literal('')),
  });

  // Get user listed properties
  useEffect(() => {
    console.log("Rendering ProfilePage component");
    console.log("Profile page initial state - User:", user);
    console.log("Profile page initial state - Loading:", loading);
    console.log("Profile page initial state - isPremium:", isPremium);
    
    if (user && !loading) {
      console.log("Profile page effect - User:", user);
      console.log("Profile page effect - Loading:", loading);
      const fetchUserListedProperties = async () => {
        try {
          console.log("Fetching user listed properties for user ID:", user.id);
          const response = await fetch(`/api/users/${user.id}/listed-properties`);
          const data = await response.json();
          console.log("User listed properties:", data);
          setUserListedProperties(data);
        } catch (error) {
          console.error('Error fetching user listed properties:', error);
          toast({
            title: 'Error',
            description: 'Failed to load your listed properties',
            variant: 'destructive',
          });
        }
      };
      fetchUserListedProperties();
    }
  }, [user, loading]);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user ? user.username : '',
      email: user && user.email ? user.email : '',
      phone: user && user.phone ? user.phone : '',
    },
  });

  // Update form defaults when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, form]);

  // Handle profile update
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsSaving(true);
    try {
      await updateProfile(values);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadProfileImage(file);
      toast({
        title: 'Image Uploaded',
        description: 'Your profile image has been updated',
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle premium upgrade
  const handlePremiumUpgrade = async () => {
    try {
      await upgradeToPremiun();
      setIsPremiumModalOpen(false);
      toast({
        title: 'Upgrade Successful',
        description: 'You are now a premium member!',
      });
    } catch (error) {
      toast({
        title: 'Upgrade Failed',
        description: 'There was an error processing your upgrade',
        variant: 'destructive',
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Will redirect due to auth protection
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-48 w-full mt-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-muted-foreground mt-2">Please log in to view your profile</p>
          <Button className="mt-4" onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="flex flex-col min-h-screen w-full pb-20 max-w-full overflow-x-hidden">
      <Helmet>
        <title>My Profile | Vue LibreEstate</title>
        <meta name="description" content="Manage your Vue LibreEstate profile, saved properties, and settings." />
      </Helmet>
      
      <main className="app-card p-0 rounded-xl overflow-hidden w-full flex-1">
        <div className="grid grid-cols-1 gap-0 w-full h-full flex flex-col">
          {/* User Profile Header */}
          <div className="bg-gradient-to-r from-primary to-primary-700 text-white p-4 sm:p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/20 mb-3 sm:mb-4">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-lg bg-primary-700">{getInitials()}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg sm:text-xl font-bold text-center">{user.username}</h2>
              <p className="text-sm text-white/80 text-center">{user.email || "No email provided"}</p>
              
              {isPremium ? (
                <Badge className="mt-2 sm:mt-3 bg-gradient-to-r from-amber-500 to-amber-700">
                  <Crown className="h-3 w-3 mr-1" /> Premium Member
                </Badge>
              ) : (
                <Button 
                  variant="secondary"
                  size="sm"
                  className="mt-2 sm:mt-3 bg-white/10 hover:bg-white/20 text-white text-sm"
                  onClick={() => setIsPremiumModalOpen(true)}
                >
                  <Crown className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            <button 
              className={`flex-1 p-2 sm:p-4 text-center font-medium ${activeTab === "overview" ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              onClick={() => setActiveTab("overview")}
            >
              <div className="flex flex-col items-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs sm:text-sm">Overview</span>
              </div>
            </button>
            <button 
              className={`flex-1 p-2 sm:p-4 text-center font-medium ${activeTab === "saved" ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              onClick={() => setActiveTab("saved")}
            >
              <div className="flex flex-col items-center">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs sm:text-sm">Saved</span>
              </div>
            </button>
            <button 
              className={`flex-1 p-2 sm:p-4 text-center font-medium ${activeTab === "listings" ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              onClick={() => setActiveTab("listings")}
            >
              <div className="flex flex-col items-center">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs sm:text-sm">Listings</span>
              </div>
            </button>
            <button 
              className={`flex-1 p-2 sm:p-4 text-center font-medium ${activeTab === "settings" ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              onClick={() => setActiveTab("settings")}
            >
              <div className="flex flex-col items-center">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs sm:text-sm">Settings</span>
              </div>
            </button>
          </div>
          
          {/* Content Area */}
          <div className="p-4 flex-1 h-full">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                  {/* Account Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Card className="bg-gray-50">
                      <CardHeader className="py-2 px-3 sm:py-4 sm:px-5">
                        <CardTitle className="text-xs sm:text-sm font-medium">Account Type</CardTitle>
                      </CardHeader>
                      <CardContent className="py-1 px-3 sm:py-2 sm:px-5">
                        <div className="flex items-center">
                          {isPremium ? (
                            <Badge className="text-xs bg-gradient-to-r from-amber-500 to-amber-700">
                              <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Free</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50">
                      <CardHeader className="py-2 px-3 sm:py-4 sm:px-5">
                        <CardTitle className="text-xs sm:text-sm font-medium">Saved Properties</CardTitle>
                      </CardHeader>
                      <CardContent className="py-1 px-3 sm:py-2 sm:px-5">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-amber-500" />
                          <span className="text-base sm:text-lg font-semibold">{user.savedProperties?.length || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50">
                      <CardHeader className="py-2 px-3 sm:py-4 sm:px-5">
                        <CardTitle className="text-xs sm:text-sm font-medium">My Listings</CardTitle>
                      </CardHeader>
                      <CardContent className="py-1 px-3 sm:py-2 sm:px-5">
                        <div className="flex items-center">
                          <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary" />
                          <span className="text-base sm:text-lg font-semibold">{userListedProperties.length}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Premium Features */}
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-amber-600" />
                        Premium Features
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {isPremium 
                          ? "Enjoy your premium benefits!"
                          : "Upgrade to unlock premium features."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                      <ul className="space-y-2 sm:space-y-3">
                        <li className="flex items-start">
                          <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isPremium ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            ✓
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Extended Property Radius</p>
                            <p className="text-xs sm:text-sm text-gray-600">Search beyond the standard 30km radius</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isPremium ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            ✓
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Ad-Free Experience</p>
                            <p className="text-xs sm:text-sm text-gray-600">Enjoy a clean, distraction-free experience</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isPremium ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            ✓
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Advanced Property Insights</p>
                            <p className="text-xs sm:text-sm text-gray-600">Detailed market analysis and price predictions</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isPremium ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            ✓
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Priority Notifications</p>
                            <p className="text-xs sm:text-sm text-gray-600">Be the first to know about new properties</p>
                          </div>
                        </li>
                      </ul>
                      
                      {!isPremium && (
                        <Button 
                          className="w-full mt-4 text-sm"
                          size="sm"
                          onClick={() => setIsPremiumModalOpen(true)}
                        >
                          <Crown className="h-3.5 w-3.5 mr-1.5" />
                          Upgrade Now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Recently Viewed */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recently Viewed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Display a few recently viewed properties here */}
                      <EmptyState 
                        title="No recently viewed properties" 
                        description="Properties you view will appear here"
                        icon={<Home className="h-12 w-12 text-muted-foreground/50" />}
                      />
                    </div>
                  </div>
              </div>
            )}
            
            {/* Saved Properties Tab */}
            {activeTab === "saved" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Saved Properties</h3>
                <div className="grid grid-cols-1 gap-4">
                  {user.savedProperties && user.savedProperties.length > 0 ? (
                    user.savedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))
                  ) : (
                    <EmptyState 
                      title="No saved properties" 
                      description="Properties you save will appear here"
                      icon={<Star className="h-12 w-12 text-muted-foreground/50" />}
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* My Listings Tab */}
            {activeTab === "listings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Listings</h3>
                  <Button size="sm" className="gap-1">
                    <Upload className="h-4 w-4 mr-1" />
                    <span>List Property</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {userListedProperties.length > 0 ? (
                    userListedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))
                  ) : (
                    <EmptyState 
                      title="No properties listed" 
                      description="Properties you list for rent or sale will appear here"
                      icon={<Home className="h-12 w-12 text-muted-foreground/50" />}
                      action={
                        <Button size="sm" className="mt-4">
                          <Upload className="h-4 w-4 mr-1" />
                          <span>List Your First Property</span>
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Account Settings</h3>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" variant="outline">Edit Profile</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>
                          Update your personal information
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="mt-6">
                              <Button type="submit" className="w-full" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>View and update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Username</span>
                        </div>
                        <span className="text-sm">{user.username}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Email</span>
                        </div>
                        <span className="text-sm">{user.email || "Not set"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Phone</span>
                        </div>
                        <span className="text-sm">{user.phone || "Not set"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Joined</span>
                        </div>
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                      <CardDescription>Manage your account security settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button size="sm" variant="outline" className="w-full">
                        Change Password
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        Two-Factor Authentication
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Danger Zone</CardTitle>
                      <CardDescription>Irreversible account actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Premium Feature Modal */}
      <PremiumFeatureModal 
        open={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={handlePremiumUpgrade}
      />
    </div>
  );
}