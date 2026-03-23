import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Phone, GraduationCap, MapPin, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const MyAccount = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseurl = import.meta.env.VITE_API_URL;

  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    mobile: '',
    profilePicture: null,
    // studyBatch: '',
    // sector: '',
    educationBg: '',
    graduationYear: ''
  });

  // Fetch user details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseurl}/api/user/myprofile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setProfileData({
            fullname: data.data.fullname || '',
            email: data.data.email || '',
            mobile: data.data.mobile || '',
            profilePicture: data.data.profilePic ? `${baseurl}${data.data.profilePic}` : null,
            // studyBatch: data.data.studyBatch || '',
            // sector: data.data.sector || '',
            educationBg: data.data.educationBg || '',
            graduationYear: data.data.graduationYear || ''
          });
          if (data.data.profilePic) {
            setPreviewImage(`${baseurl}${data.data.profilePic}`);
          }
        } else {
          toast.error(data.message || 'Failed to load profile');
        }
      } catch (err) {
        toast.error('Error fetching profile');
      }
    };

    fetchProfile();
  }, [baseurl]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Please select an image smaller than 5MB');
        return;
      }
      setProfileData((prev) => ({ ...prev, profilePicture: file }));

      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!/^\d{10}$/.test(profileData.mobile)) {
      toast.error("Mobile number must be exactly 10 digits.");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('mobile', profileData.mobile);
    // fd.append('location', profileData.location);
    // fd.append('studyBatch', profileData.studyBatch);
    fd.append('graduationYear', profileData.graduationYear);
    fd.append('educationBg', profileData.educationBg);

    // Add image only if user selected a new one
    if (profileData.profilePicture instanceof File) {
      fd.append('profilePic', profileData.profilePicture);
    }

    try {
      const res = await fetch(`${baseurl}/api/user/updateprofile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Profile updated successfully');
        if (data.data.profilePic) {
          setPreviewImage(`${baseurl}${data.data.profilePic}`);
        }
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Server error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const sectors = [
    'Software Development',
    'Data Science & Analytics',
    'Artificial Intelligence & Machine Learning',
    'Cybersecurity',
    'DevOps & Cloud Computing',
    'Product Management',
    'UI/UX Design',
    'Database Administration',
    'Network Engineering',
    'Quality Assurance'
  ];

  const studyBatches = [
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022',
    '2020-2021'
  ];

  const graduationYears = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i - 5).toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Account
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Update your account information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <Card className="bg-gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Update your profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={previewImage || '/default-avatar.png'} alt="Profile" />
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {profileData.fullname ? profileData.fullname[0] : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="profile-upload"
                      className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </Label>
                    <Input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg">
                      {profileData.fullname}
                    </h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click the upload button to change your profile picture
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={profileData.mobile}
                    onChange={(e) => {
                      // Accept only digits, max 10
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange('mobile', val);
                    }}
                    maxLength={10}
                    required
                  />
                  {profileData.mobile && !/^\d{10}$/.test(profileData.mobile) && (
                    <p className="text-red-500 text-sm mt-1">Mobile number must be exactly 10 digits.</p>
                  )}
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, State/Country"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div> */}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="bg-gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Update your educational background and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="space-y-2">
                    <Label htmlFor="studyBatch">Study Batch</Label>
                    <Select value={profileData.studyBatch} onValueChange={(value) => handleInputChange('studyBatch', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {studyBatches.map((batch) => (
                          <SelectItem key={batch} value={batch}>
                            {batch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                    <Select value={profileData.graduationYear} onValueChange={(value) => handleInputChange('graduationYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {graduationYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationBg">Educational Background</Label>
                    <Input
                      id="educationBg"
                      placeholder="e.g., B.Sc. Computer Science"
                      value={profileData.educationBg}
                      onChange={(e) => handleInputChange('educationBg', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mention your highest qualification or current course
                    </p>
                  </div>
                  </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="sector">Preferred Career Sector</Label>
                  <Select value={profileData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center pt-4"
            >
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full max-w-md bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MyAccount;