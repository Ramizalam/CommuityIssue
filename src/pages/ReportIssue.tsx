import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Upload, MapPin, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { AuthModal } from '../components/AuthModal';
type IssueCategory = 'pothole' | 'garbage' | 'water' | 'electricity' | 'other';

interface LocationMarker {
  lat: number;
  lng: number;
}

function LocationPicker({ onLocationSelect }: { onLocationSelect: (location: LocationMarker) => void }) {
  const [position, setPosition] = useState<LocationMarker | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const map = useMap();

  const handleLocateError = (error: GeolocationError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError("Please allow location access to use your current location.");
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError("Location information is unavailable. Please try clicking on the map to select your location manually.");
        break;
      case error.TIMEOUT:
        setLocationError("Location request timed out. Please try again or select location manually.");
        break;
      default:
        setLocationError("An unknown error occurred. Please try selecting your location manually by clicking on the map.");
        break;
    }
  };

  const handleLocateSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const newPos = { lat: latitude, lng: longitude };
    setPosition(newPos);
    onLocationSelect(newPos);
    map.flyTo(new LatLng(latitude, longitude), 16);
    setLocationError('');
  };

  const locateUser = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please click on the map to select your location.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleLocateSuccess,
      handleLocateError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      onLocationSelect(newPos);
      setLocationError('');
    },
  });


  useEffect(() => {
    map.setView([0, 0], 2);
    locateUser();
  }, []);

  return (
    <>
      {locationError && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
          <p className="text-sm">{locationError}</p>
          <p className="text-sm mt-1">You can:</p>
          <ul className="text-sm list-disc list-inside mt-1">
            <li>Click the location button again</li>
            <li>Click anywhere on the map to select location manually</li>
            <li>Check your browser's location permissions</li>
          </ul>
        </div>
      )}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-md shadow-md">
        <button
          type="button"
          className="p-2 hover:bg-gray-50 rounded-md flex items-center gap-2 text-sm"
          onClick={locateUser}
          title="Find my location"
        >
          <Crosshair className="h-5 w-5" />
          <span>Find my location</span>
        </button>
      </div>
      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={new Icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        />
      )}
    </>
  );
}

export function ReportIssue() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as IssueCategory,
    location: '',

  });

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
        setUserId(session?.user?.id || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUserId(session?.user?.id || null);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleLocationSelect = async (location: LocationMarker) => {
    setSelectedLocation(location);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
      );
      const data = await response.json();
      const address = data.display_name;
      setFormData(prev => ({ ...prev, location: address }));
    } catch (error) {
      console.error('Error fetching address:', error);
      setFormData(prev => ({ 
        ...prev, 
        location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setShowAuthModal(true);
        setIsSubmitting(false);
        return;
      }
      let image_url = '';
      if (imageFile) {
        try {
          image_url = await uploadImage(imageFile);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError('Failed to upload image. Please try again with a different image or without an image.');
          setIsSubmitting(false);
          return;
        }
      }

      const { error: insertError } = await supabase
        .from('issues')
        .insert([{
          ...formData,
          image_url,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          status: 'pending',
          user_id: session.user.id 
        }]);

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw new Error(insertError.message || 'Failed to submit issue');
        }
  

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      navigate('/issues');
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError,data } = await supabase.storage
      .from('issue-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('issue-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  return (
    <>
    {isAuthenticated? (<div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Report an Issue</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as IssueCategory })}
              >
                <option value="">Select a category</option>
                <option value="pothole">Pothole</option>
                <option value="garbage">Garbage</option>
                <option value="water">Water Issue</option>
                <option value="electricity">Electricity Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="location"
                  required
                  readOnly
                  placeholder="Select location on map"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
                  value={formData.location}
                />
                <MapPin className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-cover rounded"
                      />
                    </div>
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[600px] relative rounded-lg overflow-hidden shadow-md ">
            <MapContainer
              center={[0, 0]}
              zoom={2}
              className="h-full w-full"
              style={{ background: '#f0f0f0' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !selectedLocation}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form> 
    </div>) : (
      <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onSuccess={() => {
        setIsAuthenticated(true);
        setShowAuthModal(false);
      }}
    />
    ) }  
    </>
    
  );
}