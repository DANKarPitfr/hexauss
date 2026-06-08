import React, { useState, useRef, useEffect } from 'react';
/// <reference types="vite/client" />
import { ChevronLeft, MapPin, UploadCloud, Info, DollarSign, Home, BedDouble, Bath, Wifi, Car, Shield, Wind, Zap, CheckCircle2, Loader2, Phone, User, MessageCircle, Building, AlertCircle, Search, X, Clock } from 'lucide-react';
import { addDoc, collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import imageCompression from 'browser-image-compression';
import { OSMMapPicker } from './OSMMapPicker';
import Footer from './Footer';
import QRCode from 'qrcode';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Property } from '../constants';

interface PostPropertyViewProps {
  onBack: () => void;
  userProfile: any;
  editProperty?: Property;
  initialPurpose?: string;
  initialPropertyType?: string;
  onContactClick: () => void;
  onFeedbackClick: () => void;
  onAboutClick: () => void;
}

export default function PostPropertyView({ 
    onBack, 
    userProfile, 
    editProperty,
    initialPurpose = 'Rent', 
    initialPropertyType = 'Apartment',
    onContactClick,
    onFeedbackClick,
    onAboutClick
}: PostPropertyViewProps) {
  if (!userProfile) return null;

  // Map State
  const [mapPosition, setMapPosition] = useState<{lat: number, lng: number} | null>({ lat: 28.6139, lng: 77.2090 }); // default Delhi
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);
  
  // Contact
  const [ownerName, setOwnerName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(true);
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const videoUploadPromiseRef = useRef<Promise<string | null> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const propertyTypes = ['Flat', 'Apartment', 'Villa', 'Independent House', 'PG', 'Hostel', 'Commercial Shop', 'Office', 'Plot/Land'];
  const purposes = ['Rent', 'Sell'];
  const bhkOptions = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
  const bathroomOptions = ['1', '2', '3', '4+'];
  const furnishedOptions = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
  
  const allAmenities = [
    { id: 'Parking', icon: Car },
    { id: 'WiFi', icon: Wifi },
    { id: 'AC', icon: Wind },
    { id: 'Balcony', icon: Home },
    { id: 'Security', icon: Shield },
    { id: 'Lift', icon: Zap },
    { id: 'Power Backup', icon: Zap },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ('dataTransfer' in e) {
      files = e.dataTransfer.files;
    } else {
      files = e.target.files;
    }

    if (!files || files.length === 0) return;
    
    setUploading(true);
    const startTime = Date.now();
    console.log(`Starting upload of ${files.length} images...`);

    const successfulUploads: string[] = [];
    
    const uploadPromises = Array.from(files).map(async (file) => {
        let processedFile = file;
        if (processedFile.size > 5 * 1024 * 1024) {
             try {
                processedFile = await imageCompression(processedFile, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
             } catch (error) {
                console.error("Compression failed", error);
                return null;
             }
        }
        
        return uploadToCloudinary(processedFile, 'image', (p) => console.log(`Upload progress for ${processedFile.name}: ${p.toFixed(2)}%`));
    });
        
    const results = await Promise.all(uploadPromises);
    results.forEach(url => {
        if (url) successfulUploads.push(url);
    });

    setImages((prev) => [...prev, ...successfulUploads]);
    console.log(`Total image upload took ${Date.now() - startTime}ms`);
    setUploading(false);
  };

  const handleVideoUpload = async (file: File): Promise<string | null> => {
    if (file.size > 50 * 1024 * 1024) {
      alert('Video too large (max 50MB)');
      return null;
    }

    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      alert('Invalid video format. Use MP4, MOV, or WebM.');
      return null;
    }

    setVideoUploading(true);
    setVideoProgress(0);
    const startTime = Date.now();
    console.log(`Starting video upload: ${file.name}`);

    const url = await uploadToCloudinary(file, 'video', (p) => setVideoProgress(p));
    
    if (url) {
        setVideo(url);
        console.log(`Video upload finished in ${Date.now() - startTime}ms`);
    } else {
        alert('Video upload failed');
    }
    
    setVideoUploading(false);
    return url;
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: string) => {
    if (amenities.includes(id)) {
      setAmenities(amenities.filter(a => a !== id));
    } else {
      setAmenities([...amenities, id]);
    }
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  
  // State for form fields
  const [title, setTitle] = useState(editProperty?.title || '');
  const [propertyType, setPropertyType] = useState(editProperty?.type || initialPropertyType);
  const [purpose, setPurpose] = useState(editProperty?.price.includes('/mo') ? 'Rent' : initialPurpose);
  const [price, setPrice] = useState(editProperty?.price.replace(/[₹,/mo ]/g, '') || '');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [bhk, setBhk] = useState('2 BHK');
  const [bathrooms, setBathrooms] = useState('2');
  const [furnished, setFurnished] = useState('Semi-Furnished');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in`);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        const nameParts = data[0].display_name.split(',');
        setLocation(nameParts[0]);
        if (nameParts.length > 1) {
          setCity(nameParts[1].trim());
        }
        if (data[0].address) {
          if (data[0].address.state) setState(data[0].address.state);
          if (data[0].address.postcode) setPincode(data[0].address.postcode);
        }
      }
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const isPhoneValid = /^(?:\+91[\s-]?)?[0]?(?:91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
  const isNameValid = ownerName.trim().length >= 2;
  const isContactValid = isPhoneValid && isNameValid;

  const handlePublishClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isContactValid || !title || !price || !location) {
       setPhoneError(!isPhoneValid);
       setNameError(!isNameValid);
       setShowErrorToast(true);
       setTimeout(() => setShowErrorToast(false), 3000);
       return;
    }
    
    setIsPublishing(true);
    
    if (!isOnline) {
        alert("You are offline. Please check your internet connection.");
        setIsPublishing(false);
        return;
    }
    
    try {
        let finalVideoUrl = video;
        
        // Ensure video finishes if already uploading
        if (videoUploadPromiseRef.current) {
            finalVideoUrl = await videoUploadPromiseRef.current;
        } else if (videoInputRef.current?.files?.[0] && !video) {
            const file = videoInputRef.current?.files?.[0];
            if (file) {
                finalVideoUrl = await handleVideoUpload(file);
            }
        }
    
        const propRef = editProperty ? doc(db, 'properties', editProperty.id) : doc(collection(db, 'properties'));
        const propertyUrl = `/property/${propRef.id}`;
        
        const propertyData = {
            id: propRef.id,
            propertyUrl,
            title,
            price: price.startsWith('₹') ? price : `₹${price}${purpose === 'Rent' ? '/mo' : ''}`,
            location: `${location}, ${city}`,
            image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
            images: images,
            bhk: bhk,
            area: area ? `${area} sqft` : undefined,
            type: propertyType,
            furnishing: furnished,
            ownerName: ownerName,
            description: description,
            amenities: amenities,
            phoneNumber: phone,
            lat: mapPosition?.lat,
            lng: mapPosition?.lng,
            ownerId: editProperty?.ownerId || auth.currentUser?.uid,
            pincode,
            createdAt: editProperty?.createdAt || serverTimestamp(),
            status: editProperty?.status || 'pending',
            views: editProperty?.views || 0,
            savedBy: editProperty?.savedBy || [],
            rating: editProperty?.rating || 5,
            reviewCount: editProperty?.reviewCount || 0,
            videoUrl: finalVideoUrl || undefined
        };
        
        // Timeout wrapper for Firestore operation
        const setDocPromise = setDoc(propRef, propertyData, { merge: true });
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Property publishing timed out')), 30000)
        );
        
        await Promise.race([setDocPromise, timeoutPromise]);
        
        setIsSubmitted(true);
    } catch (err) {
      console.error("Error saving property:", err);
      alert(err instanceof Error ? err.message : "Error publishing property");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isSubmitted) {
    return (
        <div className="fixed inset-0 bg-luxury-bg flex items-center justify-center p-6 z-50">
            <div className="bg-luxury-surface/60 backdrop-blur-xl border border-luxury-border/50 p-8 rounded-[32px] shadow-neo-dark text-center space-y-6">
                <div className="w-16 h-16 bg-luxury-citrus/20 rounded-full flex items-center justify-center mx-auto text-luxury-citrus">
                    <Clock size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-luxury-cream">Property is under review</h2>
                    <p className="text-luxury-text text-sm">We are reviewing your property. It will be live after admin approval.</p>
                </div>
                <button onClick={onBack} className="w-full bg-luxury-citrus text-[#121212] font-bold py-3 rounded-xl">Back to Home</button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 pb-24 font-sans text-luxury-text bg-luxury-bg z-50 fixed inset-0 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-xl border-b border-luxury-border/20 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-luxury-surface rounded-full shadow-neo-dark-sm hover:shadow-glow-sm transition-all text-luxury-text hover:text-luxury-citrus border border-luxury-border/30"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-luxury-cream">Post Property</h1>
            <p className="text-[10px] text-luxury-text/60 font-medium">List your property and reach more people</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 space-y-8 pb-32">
        {/* PROPERTY DETAILS */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Property Details</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Home size={12}/> Property Title</label>
              <input type="text" placeholder="e.g. Luxury Villa with Pool" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider">Purpose</label>
              <div className="flex gap-2 p-1 bg-luxury-bg rounded-xl shadow-neo-dark-inset border border-luxury-border/20">
                {purposes.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPurpose(p)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      purpose === p 
                      ? 'bg-luxury-surface text-luxury-citrus shadow-glow-sm border border-luxury-citrus/30' 
                      : 'text-luxury-text hover:text-luxury-cream'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Building size={12}/> Property Type</label>
              <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset appearance-none">
                {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><DollarSign size={12}/> Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-luxury-text/50 font-bold">₹</span>
                </div>
                <input type="text" placeholder="15,000 or 1.2 Cr" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl pl-8 pr-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider">BHK Type</label>
                <select value={bhk} onChange={e => setBhk(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream shadow-neo-dark-inset appearance-none focus:border-luxury-citrus focus:outline-none">
                  {bhkOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider">Bathrooms</label>
                <select value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream shadow-neo-dark-inset appearance-none focus:border-luxury-citrus focus:outline-none">
                  {bathroomOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider">Area (sq ft) (Optional)</label>
              <input type="number" placeholder="e.g. 1200" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><BedDouble size={12}/> Furnishing</label>
              <div className="flex flex-wrap gap-2">
                {furnishedOptions.map(f => (
                  <button 
                    key={f}
                    onClick={() => setFurnished(f)}
                    className={`flex-1 py-2 px-2 text-[10px] sm:text-xs font-bold rounded-xl shadow-neo-dark-sm transition-colors border ${
                      furnished === f 
                        ? 'bg-luxury-surface text-luxury-citrus border-luxury-citrus shadow-neo-dark-inset' 
                        : 'bg-luxury-bg text-luxury-cream border-luxury-border/30 hover:border-luxury-citrus/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Info size={12}/> Property Description</label>
               <textarea placeholder="Describe the property..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset resize-none" />
            </div>
          </div>
        </section>

        {/* LOCATION & MAP */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Location</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-4">
             <form onSubmit={handleMapSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-text/50" />
                <input type="text" placeholder="Search location to pin..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset" />
              </div>
              <button type="submit" disabled={isSearching} className="px-4 py-2.5 bg-luxury-surface border border-luxury-border/30 rounded-xl text-xs font-bold text-luxury-cream hover:text-luxury-citrus hover:border-luxury-citrus/50 transition-colors shadow-neo-dark-sm">
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
              </button>
            </form>
                    <div className="w-full h-48 bg-luxury-bg rounded-xl mt-2 relative overflow-hidden border border-luxury-border/30 z-0">
               <OSMMapPicker
                  position={mapPosition}
                  onPositionChange={setMapPosition}
                  onAddressFound={(address) => {
                     setLocation(address.location);
                     setCity(address.city);
                     setState(address.state);
                     setPincode(address.pincode);
                  }}
               />
               <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white shadow-glow-sm z-[1000] pointer-events-none">
                 Tap map to drop pin
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-2">
               <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><MapPin size={12}/> Area / Locality</label>
                <input type="text" placeholder="e.g. Andheri West" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset leading-tight truncate" />
              </div>
               <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><MapPin size={12}/> City</label>
                <input type="text" placeholder="e.g. Mumbai" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset leading-tight truncate" />
              </div>
               <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><MapPin size={12}/> State</label>
                <input type="text" placeholder="e.g. Maharashtra" value={state} onChange={e => setState(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset leading-tight truncate" />
              </div>
               <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><MapPin size={12}/> PIN Code</label>
                <input type="text" placeholder="e.g. 400053" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full bg-luxury-bg border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus shadow-neo-dark-inset leading-tight truncate" />
              </div>
            </div>
          </div>
        </section>

        {/* IMAGES */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Photos</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-4">
             <div 
                className="grid grid-cols-3 gap-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleImageUpload(e as any); }}
             >
               {images.map((img, idx) => (
                 <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-luxury-border/50 relative group">
                   <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                   <button 
                     onClick={() => removeImage(idx)}
                     className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                   >
                     <X size={12} />
                   </button>
                 </div>
               ))}
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-luxury-border/50 bg-luxury-bg/50 hover:bg-luxury-bg flex items-center justify-center flex-col gap-2 transition-colors group"
               >
                 {uploading ? <Loader2 size={24} className="animate-spin text-luxury-citrus"/> : <UploadCloud className="text-luxury-text/50 group-hover:text-luxury-citrus transition-colors" size={24} />}
                 <span className="text-[10px] text-luxury-text/50 group-hover:text-luxury-citrus font-medium">{uploading ? 'Uploading...' : 'Add Photos'}</span>
               </button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Video (Optional)</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4">
             {video ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-luxury-border">
                    <video src={video} className="w-full h-full object-cover" controls />
                    <button onClick={() => setVideo(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X size={16} /></button>
                </div>
             ) : (
                <button 
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-luxury-border/50 bg-luxury-bg/50 hover:bg-luxury-bg flex items-center justify-center flex-col gap-2 transition-colors group"
                >
                    {videoUploading ? (
                        <div className="text-center space-y-2">
                             <Loader2 size={24} className="animate-spin text-luxury-citrus mx-auto" />
                             <p className="text-xs text-luxury-cream">{Math.round(videoProgress)}% Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className="text-luxury-text/50 group-hover:text-luxury-citrus transition-colors" size={24} />
                            <span className="text-[10px] text-luxury-text/50 group-hover:text-luxury-citrus font-medium">Add Video (MP4/MOV/WebM)</span>
                        </>
                    )}
                </button>
             )}
             <input type="file" ref={videoInputRef} className="hidden" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => { if(e.target.files?.[0]) videoUploadPromiseRef.current = handleVideoUpload(e.target.files[0]); }} />
          </div>
        </section>

        {/* AMENITIES */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Amenities</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4">
            <div className="flex flex-wrap gap-2">
              {allAmenities.map(amenity => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-neo-dark-sm ${
                    amenities.includes(amenity.id)
                    ? 'bg-luxury-surface text-luxury-citrus border-luxury-citrus shadow-neo-dark-inset'
                    : 'bg-luxury-bg text-luxury-text border-luxury-border/30 hover:border-luxury-citrus/50'
                  }`}
                >
                   <amenity.icon size={14} />
                   {amenity.id}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTCION */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-text/60 mb-3 px-2">Contact Details</h3>
          <div className="bg-luxury-surface/60 backdrop-blur-sm rounded-[24px] shadow-neo-dark border border-luxury-border/40 p-4 space-y-4">
             <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><User size={12}/> Owner Name</label>
              <input type="text" value={ownerName} onChange={e => {setOwnerName(e.target.value); setNameError(false);}} className={`w-full bg-luxury-bg border ${nameError ? 'border-red-500/80 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]' : 'border-luxury-border/30 shadow-neo-dark-inset'} rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus transition-all`} />
              {nameError && <p className="text-[10px] font-bold text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Name cannot be empty</p>}
            </div>
             <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-luxury-text/50 tracking-wider flex items-center gap-1"><Phone size={12}/> Phone Number</label>
              <input type="tel" value={phone} onChange={e => {setPhone(e.target.value); setPhoneError(false);}} className={`w-full bg-luxury-bg border ${phoneError ? 'border-red-500/80 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]' : 'border-luxury-border/30 shadow-neo-dark-inset'} rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none focus:border-luxury-citrus transition-all`} />
              {phoneError && <p className="text-[10px] font-bold text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Invalid phone number format</p>}
            </div>
            <div className="flex items-center justify-between p-3 bg-luxury-bg rounded-xl border border-luxury-border/30 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                  <MessageCircle size={16} />
                </div>
                <span className="text-sm font-semibold text-luxury-cream">Available on WhatsApp</span>
              </div>
              <button 
                onClick={() => setWhatsapp(!whatsapp)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${whatsapp ? 'bg-luxury-citrus' : 'bg-luxury-surface shadow-neo-dark-inset'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${whatsapp ? 'translate-x-6' : 'translate-x-0 bg-luxury-text/50'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* POST BUTTON */}
        <div className="pt-4 pb-8 relative">
            <button 
                onClick={handlePublishClick}
                disabled={isPublishing || uploading || videoUploading}
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-[20px] active:scale-95 transition-all text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 ${
                  isContactValid && title && price && location ? 'bg-luxury-citrus hover:bg-luxury-citrus-light text-[#121212] shadow-[0_0_20px_rgba(255,182,39,0.3)]' : 'bg-luxury-bg border border-luxury-border/50 text-luxury-text hover:text-luxury-cream hover:bg-luxury-surface shadow-none'
                }`}
            >
                {isPublishing || uploading || videoUploading? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {uploading ? 'Uploading Images...' : (videoUploading ? 'Uploading Video...' : 'Publishing...')}
                  </>
                ) : (
                  'Publish Property'
                )}
            </button>
            
            <div className={`absolute -top-12 left-0 right-0 flex justify-center transition-all duration-300 pointer-events-none z-50 ${showErrorToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.1)] backdrop-blur-md">
                <AlertCircle size={14} /> Please fill out all required fields properly.
              </div>
            </div>
        </div>
        <Footer 
            onContactClick={onContactClick}
            onFeedbackClick={onFeedbackClick}
            onAboutClick={onAboutClick}
        />
      </main>
    </div>
  );
}
