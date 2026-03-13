export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
};

type TranslationKeys = {
  nav: { users: string; hospitals: string; info: string; home: string };
  home: {
    title: string;
    subtitle: string;
    insurance: string;
    findHospital: string;
    insuranceDesc: string;
    findHospitalDesc: string;
  };
  insurance: {
    title: string;
    types: string;
    typesDesc: string;
    coverage: string;
    coverageDesc: string;
    benefits: string;
    benefitsDesc: string;
    eligibility: string;
    eligibilityDesc: string;
    claimProcess: string;
    claimProcessDesc: string;
    faqs: string;
    individualHealth: string;
    familyFloater: string;
    groupHealth: string;
    criticalIllness: string;
    seniorCitizen: string;
  };
  findHospital: {
    title: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
    name: string;
    age: string;
    state: string;
    district: string;
    healthProblem: string;
    bookingDate: string;
    next: string;
    back: string;
    viewDoctors: string;
    bookSlot: string;
    bookAppointment: string;
    availableSlots: string;
    noHospitals: string;
    noDoctors: string;
    noSlots: string;
    experience: string;
    years: string;
  };
  payment: {
    title: string;
    email: string;
    phone: string;
    transactionId: string;
    scanQR: string;
    submit: string;
    success: string;
    failure: string;
  };
  thankYou: {
    title: string;
    message: string;
    quote: string;
    backHome: string;
  };
  hospitalMenu: {
    title: string;
    request: string;
    requestDesc: string;
    admin: string;
    adminDesc: string;
  };
  hospitalRequest: {
    title: string;
    hospitalName: string;
    email: string;
    phone: string;
    state: string;
    district: string;
    address: string;
    specializations: string;
    doctors: string;
    upiQr: string;
    submit: string;
    success: string;
  };
  admin: {
    login: string;
    email: string;
    password: string;
    loginBtn: string;
    dashboard: string;
    pending: string;
    approved: string;
    rejected: string;
    accept: string;
    deny: string;
    logout: string;
    noRequests: string;
  };
  common: {
    loading: string;
    error: string;
    selectOption: string;
  };
};

export const translations: Record<Language, TranslationKeys> = {
  en: {
    nav: { users: 'Users', hospitals: 'Hospitals', info: 'Info', home: 'Home' },
    home: {
      title: 'MEDICONNECT',
      subtitle: 'A Smart Platform Connecting Patients, Hospitals, and Insurance Services Across India',
      insurance: 'Insurance',
      findHospital: 'Find Hospital',
      insuranceDesc: 'Explore health insurance plans, coverage & benefits',
      findHospitalDesc: 'Search hospitals & book appointments near you',
    },
    insurance: {
      title: 'Health Insurance Information',
      types: 'Types of Health Insurance',
      typesDesc: 'Understand different health insurance plans available in India',
      coverage: 'Coverage Details',
      coverageDesc: 'Hospitalization, pre/post care, ambulance, daycare procedures, and more',
      benefits: 'Key Benefits',
      benefitsDesc: 'Cashless treatment, tax benefits under 80D, no-claim bonus, and lifelong renewability',
      eligibility: 'Eligibility Criteria',
      eligibilityDesc: 'Age 18-65 for most plans, family floater covers entire family under one premium',
      claimProcess: 'Claim Process',
      claimProcessDesc: 'Cashless claims at network hospitals or reimbursement claims with documents',
      faqs: 'Frequently Asked Questions',
      individualHealth: 'Individual Health Insurance',
      familyFloater: 'Family Floater Plans',
      groupHealth: 'Group Health Insurance',
      criticalIllness: 'Critical Illness Cover',
      seniorCitizen: 'Senior Citizen Plans',
    },
    findHospital: {
      title: 'Find a Hospital',
      step1: 'Patient Details',
      step2: 'Select Hospital',
      step3: 'Choose Doctor',
      step4: 'Book Slot',
      step5: 'Payment',
      step6: 'Confirmation',
      name: 'Full Name',
      age: 'Age',
      state: 'State',
      district: 'District',
      healthProblem: 'Health Problem',
      bookingDate: 'Booking Date',
      next: 'Next',
      back: 'Back',
      viewDoctors: 'View Doctors',
      bookSlot: 'Book Slot',
      bookAppointment: 'Book Appointment',
      availableSlots: 'Available Slots',
      noHospitals: 'No hospitals found for your criteria',
      noDoctors: 'No doctors available',
      noSlots: 'No available slots',
      experience: 'Experience',
      years: 'years',
    },
    payment: {
      title: 'Payment',
      email: 'Email (Optional)',
      phone: 'Phone Number',
      transactionId: 'Transaction ID',
      scanQR: 'Scan UPI QR Code to Pay',
      submit: 'Confirm Payment',
      success: 'Payment Successful!',
      failure: 'Payment Not Successful',
    },
    thankYou: {
      title: 'Thank You for Visiting MEDICONNECT',
      message: 'Your appointment has been booked successfully.',
      quote: '"Health is the greatest wealth."',
      backHome: 'Back to Home',
    },
    hospitalMenu: {
      title: 'Hospitals',
      request: 'Hospital Request',
      requestDesc: 'Request your hospital to be listed on MEDICONNECT',
      admin: 'Super Admin',
      adminDesc: 'Manage hospital approvals and platform settings',
    },
    hospitalRequest: {
      title: 'Hospital Onboarding Request',
      hospitalName: 'Hospital Name',
      email: 'Hospital Email',
      phone: 'Phone Number',
      state: 'State',
      district: 'District',
      address: 'Full Address',
      specializations: 'Specializations',
      doctors: 'Doctors (Optional)',
      upiQr: 'Upload UPI QR Code',
      submit: 'Submit Request',
      success: 'Your request has been submitted! We will review it shortly.',
    },
    admin: {
      login: 'Super Admin Login',
      email: 'Email',
      password: 'Password',
      loginBtn: 'Login',
      dashboard: 'Admin Dashboard',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      accept: 'Accept',
      deny: 'Deny',
      logout: 'Logout',
      noRequests: 'No hospital requests found',
    },
    common: { loading: 'Loading...', error: 'Something went wrong', selectOption: 'Select an option' },
  },
  hi: {
    nav: { users: 'उपयोगकर्ता', hospitals: 'अस्पताल', info: 'जानकारी', home: 'होम' },
    home: {
      title: 'MEDICONNECT',
      subtitle: 'भारत भर में रोगियों, अस्पतालों और बीमा सेवाओं को जोड़ने वाला एक स्मार्ट प्लेटफॉर्म',
      insurance: 'बीमा',
      findHospital: 'अस्पताल खोजें',
      insuranceDesc: 'स्वास्थ्य बीमा योजनाएं, कवरेज और लाभ जानें',
      findHospitalDesc: 'अपने पास अस्पताल खोजें और अपॉइंटमेंट बुक करें',
    },
    insurance: {
      title: 'स्वास्थ्य बीमा जानकारी',
      types: 'स्वास्थ्य बीमा के प्रकार',
      typesDesc: 'भारत में उपलब्ध विभिन्न स्वास्थ्य बीमा योजनाओं को समझें',
      coverage: 'कवरेज विवरण',
      coverageDesc: 'अस्पताल में भर्ती, पूर्व/पश्चात देखभाल, एम्बुलेंस, डेकेयर प्रक्रियाएं, और बहुत कुछ',
      benefits: 'मुख्य लाभ',
      benefitsDesc: 'कैशलेस उपचार, 80D के तहत कर लाभ, नो-क्लेम बोनस, और आजीवन नवीनीकरण',
      eligibility: 'पात्रता मानदंड',
      eligibilityDesc: 'अधिकांश योजनाओं के लिए आयु 18-65, परिवार फ्लोटर पूरे परिवार को एक प्रीमियम में कवर करता है',
      claimProcess: 'दावा प्रक्रिया',
      claimProcessDesc: 'नेटवर्क अस्पतालों में कैशलेस दावे या दस्तावेजों के साथ प्रतिपूर्ति दावे',
      faqs: 'अक्सर पूछे जाने वाले प्रश्न',
      individualHealth: 'व्यक्तिगत स्वास्थ्य बीमा',
      familyFloater: 'पारिवारिक फ्लोटर योजनाएं',
      groupHealth: 'समूह स्वास्थ्य बीमा',
      criticalIllness: 'गंभीर बीमारी कवर',
      seniorCitizen: 'वरिष्ठ नागरिक योजनाएं',
    },
    findHospital: {
      title: 'अस्पताल खोजें',
      step1: 'रोगी विवरण',
      step2: 'अस्पताल चुनें',
      step3: 'डॉक्टर चुनें',
      step4: 'स्लॉट बुक करें',
      step5: 'भुगतान',
      step6: 'पुष्टि',
      name: 'पूरा नाम',
      age: 'आयु',
      state: 'राज्य',
      district: 'जिला',
      healthProblem: 'स्वास्थ्य समस्या',
      bookingDate: 'बुकिंग तिथि',
      next: 'अगला',
      back: 'पीछे',
      viewDoctors: 'डॉक्टर देखें',
      bookSlot: 'स्लॉट बुक करें',
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      availableSlots: 'उपलब्ध स्लॉट',
      noHospitals: 'आपके मानदंडों के लिए कोई अस्पताल नहीं मिला',
      noDoctors: 'कोई डॉक्टर उपलब्ध नहीं',
      noSlots: 'कोई उपलब्ध स्लॉट नहीं',
      experience: 'अनुभव',
      years: 'वर्ष',
    },
    payment: {
      title: 'भुगतान',
      email: 'ईमेल (वैकल्पिक)',
      phone: 'फोन नंबर',
      transactionId: 'लेनदेन आईडी',
      scanQR: 'भुगतान के लिए UPI QR कोड स्कैन करें',
      submit: 'भुगतान की पुष्टि करें',
      success: 'भुगतान सफल!',
      failure: 'भुगतान असफल',
    },
    thankYou: {
      title: 'MEDICONNECT पर आने के लिए धन्यवाद',
      message: 'आपकी अपॉइंटमेंट सफलतापूर्वक बुक हो गई है।',
      quote: '"स्वास्थ्य ही सबसे बड़ा धन है।"',
      backHome: 'होम पर वापस जाएं',
    },
    hospitalMenu: {
      title: 'अस्पताल',
      request: 'अस्पताल अनुरोध',
      requestDesc: 'MEDICONNECT पर अपने अस्पताल को सूचीबद्ध करने का अनुरोध करें',
      admin: 'सुपर एडमिन',
      adminDesc: 'अस्पताल अनुमोदन और प्लेटफॉर्म सेटिंग्स प्रबंधित करें',
    },
    hospitalRequest: {
      title: 'अस्पताल ऑनबोर्डिंग अनुरोध',
      hospitalName: 'अस्पताल का नाम',
      email: 'अस्पताल ईमेल',
      phone: 'फोन नंबर',
      state: 'राज्य',
      district: 'जिला',
      address: 'पूरा पता',
      specializations: 'विशेषज्ञता',
      doctors: 'डॉक्टर (वैकल्पिक)',
      upiQr: 'UPI QR कोड अपलोड करें',
      submit: 'अनुरोध जमा करें',
      success: 'आपका अनुरोध जमा कर दिया गया है! हम जल्द ही इसकी समीक्षा करेंगे।',
    },
    admin: {
      login: 'सुपर एडमिन लॉगिन',
      email: 'ईमेल',
      password: 'पासवर्ड',
      loginBtn: 'लॉगिन',
      dashboard: 'एडमिन डैशबोर्ड',
      pending: 'लंबित',
      approved: 'स्वीकृत',
      rejected: 'अस्वीकृत',
      accept: 'स्वीकार करें',
      deny: 'अस्वीकार करें',
      logout: 'लॉगआउट',
      noRequests: 'कोई अस्पताल अनुरोध नहीं मिला',
    },
    common: { loading: 'लोड हो रहा है...', error: 'कुछ गलत हो गया', selectOption: 'एक विकल्प चुनें' },
  },
  te: {
    nav: { users: 'వినియోగదారులు', hospitals: 'ఆసుపత్రులు', info: 'సమాచారం', home: 'హోమ్' },
    home: {
      title: 'MEDICONNECT',
      subtitle: 'భారతదేశం అంతటా రోగులు, ఆసుపత్రులు మరియు భీమా సేవలను అనుసంధానించే స్మార్ట్ ప్లాట్‌ఫారమ్',
      insurance: 'భీమా',
      findHospital: 'ఆసుపత్రి కనుగొనండి',
      insuranceDesc: 'ఆరోగ్య భీమా ప్రణాళికలు, కవరేజ్ & ప్రయోజనాలను అన్వేషించండి',
      findHospitalDesc: 'మీ సమీపంలో ఆసుపత్రులను శోధించండి & అపాయింట్‌మెంట్‌లను బుక్ చేయండి',
    },
    insurance: {
      title: 'ఆరోగ్య భీమా సమాచారం',
      types: 'ఆరోగ్య భీమా రకాలు',
      typesDesc: 'భారతదేశంలో అందుబాటులో ఉన్న వివిధ ఆరోగ్య భీమా ప్రణాళికలను అర్థం చేసుకోండి',
      coverage: 'కవరేజ్ వివరాలు',
      coverageDesc: 'ఆసుపత్రిలో చేరిక, ముందు/తర్వాత సంరక్షణ, అంబులెన్స్, డేకేర్ ప్రక్రియలు',
      benefits: 'ముఖ్య ప్రయోజనాలు',
      benefitsDesc: 'క్యాష్‌లెస్ చికిత్స, 80D కింద పన్ను ప్రయోజనాలు, నో-క్లెయిమ్ బోనస్',
      eligibility: 'అర్హత ప్రమాణాలు',
      eligibilityDesc: 'చాలా ప్రణాళికలకు వయస్సు 18-65',
      claimProcess: 'క్లెయిమ్ ప్రక్రియ',
      claimProcessDesc: 'నెట్‌వర్క్ ఆసుపత్రులలో క్యాష్‌లెస్ క్లెయిమ్‌లు లేదా రీయింబర్స్‌మెంట్ క్లెయిమ్‌లు',
      faqs: 'తరచుగా అడిగే ప్రశ్నలు',
      individualHealth: 'వ్యక్తిగత ఆరోగ్య భీమా',
      familyFloater: 'కుటుంబ ఫ్లోటర్ ప్రణాళికలు',
      groupHealth: 'సమూహ ఆరోగ్య భీమా',
      criticalIllness: 'క్రిటికల్ ఇల్‌నెస్ కవర్',
      seniorCitizen: 'సీనియర్ సిటిజన్ ప్రణాళికలు',
    },
    findHospital: {
      title: 'ఆసుపత్రి కనుగొనండి',
      step1: 'రోగి వివరాలు',
      step2: 'ఆసుపత్రి ఎంచుకోండి',
      step3: 'డాక్టర్ ఎంచుకోండి',
      step4: 'స్లాట్ బుక్ చేయండి',
      step5: 'చెల్లింపు',
      name: 'పూర్తి పేరు',
      age: 'వయస్సు',
      state: 'రాష్ట్రం',
      district: 'జిల్లా',
      healthProblem: 'ఆరోగ్య సమస్య',
      bookingDate: 'బుకింగ్ తేదీ',
      next: 'తదుపరి',
      back: 'వెనుకకు',
      viewDoctors: 'డాక్టర్లను చూడండి',
      bookSlot: 'స్లాట్ బుక్ చేయండి',
      bookAppointment: 'అపాయింట్‌మెంట్ బుక్ చేయండి',
      availableSlots: 'అందుబాటులో ఉన్న స్లాట్‌లు',
      noHospitals: 'మీ ప్రమాణాలకు ఆసుపత్రులు కనుగొనబడలేదు',
      noDoctors: 'డాక్టర్లు అందుబాటులో లేరు',
      noSlots: 'అందుబాటులో స్లాట్‌లు లేవు',
      experience: 'అనుభవం',
      years: 'సంవత్సరాలు',
    },
    payment: {
      title: 'చెల్లింపు',
      email: 'ఇమెయిల్ (ఐచ్ఛికం)',
      phone: 'ఫోన్ నంబర్',
      transactionId: 'లావాదేవీ ID',
      scanQR: 'చెల్లించడానికి UPI QR కోడ్ స్కాన్ చేయండి',
      submit: 'చెల్లింపు నిర్ధారించండి',
      success: 'చెల్లింపు విజయవంతం!',
      failure: 'చెల్లింపు విజయవంతం కాలేదు',
    },
    thankYou: {
      title: 'MEDICONNECT సందర్శించినందుకు ధన్యవాదాలు',
      message: 'మీ అపాయింట్‌మెంట్ విజయవంతంగా బుక్ చేయబడింది.',
      quote: '"ఆరోగ్యమే మహా భాగ్యం."',
      backHome: 'హోమ్‌కి తిరిగి వెళ్ళండి',
    },
    hospitalMenu: {
      title: 'ఆసుపత్రులు',
      request: 'ఆసుపత్రి అభ్యర్థన',
      requestDesc: 'MEDICONNECT లో మీ ఆసుపత్రిని నమోదు చేయమని అభ్యర్థించండి',
      admin: 'సూపర్ అడ్మిన్',
      adminDesc: 'ఆసుపత్రి ఆమోదాలు మరియు ప్లాట్‌ఫారమ్ సెట్టింగ్‌లను నిర్వహించండి',
    },
    hospitalRequest: {
      title: 'ఆసుపత్రి ఆన్‌బోర్డింగ్ అభ్యర్థన',
      hospitalName: 'ఆసుపత్రి పేరు',
      email: 'ఆసుపత్రి ఇమెయిల్',
      phone: 'ఫోన్ నంబర్',
      state: 'రాష్ట్రం',
      district: 'జిల్లా',
      address: 'పూర్తి చిరునామా',
      specializations: 'ప్రత్యేకతలు',
      doctors: 'డాక్టర్లు (ఐచ్ఛికం)',
      upiQr: 'UPI QR కోడ్ అప్‌లోడ్ చేయండి',
      submit: 'అభ్యర్థన సమర్పించండి',
      success: 'మీ అభ్యర్థన సమర్పించబడింది! మేము త్వరలో దీనిని సమీక్షిస్తాము.',
    },
    admin: {
      login: 'సూపర్ అడ్మిన్ లాగిన్',
      email: 'ఇమెయిల్',
      password: 'పాస్‌వర్డ్',
      loginBtn: 'లాగిన్',
      dashboard: 'అడ్మిన్ డాష్‌బోర్డ్',
      pending: 'పెండింగ్',
      approved: 'ఆమోదించబడింది',
      rejected: 'తిరస్కరించబడింది',
      accept: 'ఆమోదించండి',
      deny: 'తిరస్కరించండి',
      logout: 'లాగ్‌అవుట్',
      noRequests: 'ఆసుపత్రి అభ్యర్థనలు కనుగొనబడలేదు',
    },
    common: { loading: 'లోడ్ అవుతోంది...', error: 'ఏదో తప్పు జరిగింది', selectOption: 'ఒక ఎంపిక ఎంచుకోండి' },
  },
  ta: {
    nav: { users: 'பயனர்கள்', hospitals: 'மருத்துவமனைகள்', info: 'தகவல்', home: 'முகப்பு' },
    home: {
      title: 'MEDICONNECT',
      subtitle: 'இந்தியா முழுவதும் நோயாளிகள், மருத்துவமனைகள் மற்றும் காப்பீட்டு சேவைகளை இணைக்கும் ஸ்மார்ட் தளம்',
      insurance: 'காப்பீடு',
      findHospital: 'மருத்துவமனை கண்டுபிடி',
      insuranceDesc: 'சுகாதார காப்பீட்டு திட்டங்கள், கவரேஜ் & நன்மைகளை ஆராயுங்கள்',
      findHospitalDesc: 'உங்கள் அருகில் மருத்துவமனைகளைத் தேடி சந்திப்புகளை முன்பதிவு செய்யுங்கள்',
    },
    insurance: {
      title: 'சுகாதார காப்பீட்டு தகவல்',
      types: 'சுகாதார காப்பீட்டு வகைகள்',
      typesDesc: 'இந்தியாவில் கிடைக்கும் பல்வேறு சுகாதார காப்பீட்டு திட்டங்களைப் புரிந்துகொள்ளுங்கள்',
      coverage: 'கவரேஜ் விவரங்கள்',
      coverageDesc: 'மருத்துவமனை அனுமதி, முன்/பின் பராமரிப்பு, ஆம்புலன்ஸ், டேகேர் நடைமுறைகள்',
      benefits: 'முக்கிய நன்மைகள்',
      benefitsDesc: 'பணமில்லா சிகிச்சை, 80D கீழ் வரி நன்மைகள், நோ-க்ளெய்ம் போனஸ்',
      eligibility: 'தகுதி அளவுகோல்கள்',
      eligibilityDesc: 'பெரும்பாலான திட்டங்களுக்கு வயது 18-65',
      claimProcess: 'க்ளெய்ம் செயல்முறை',
      claimProcessDesc: 'நெட்வொர்க் மருத்துவமனைகளில் பணமில்லா க்ளெய்ம்கள் அல்லது திருப்பிச் செலுத்தும் க்ளெய்ம்கள்',
      faqs: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      individualHealth: 'தனிநபர் சுகாதார காப்பீடு',
      familyFloater: 'குடும்ப ஃப்ளோட்டர் திட்டங்கள்',
      groupHealth: 'குழு சுகாதார காப்பீடு',
      criticalIllness: 'தீவிர நோய் கவர்',
      seniorCitizen: 'மூத்த குடிமக்கள் திட்டங்கள்',
    },
    findHospital: {
      title: 'மருத்துவமனை கண்டுபிடி',
      step1: 'நோயாளி விவரங்கள்',
      step2: 'மருத்துவமனை தேர்வு',
      step3: 'மருத்துவர் தேர்வு',
      step4: 'ஸ்லாட் முன்பதிவு',
      step5: 'கட்டணம்',
      name: 'முழு பெயர்',
      age: 'வயது',
      state: 'மாநிலம்',
      district: 'மாவட்டம்',
      healthProblem: 'சுகாதார பிரச்சனை',
      bookingDate: 'முன்பதிவு தேதி',
      next: 'அடுத்து',
      back: 'பின்செல்',
      viewDoctors: 'மருத்துவர்களைப் பார்',
      bookSlot: 'ஸ்லாட் முன்பதிவு',
      bookAppointment: 'சந்திப்பு முன்பதிவு',
      availableSlots: 'கிடைக்கும் ஸ்லாட்டுகள்',
      noHospitals: 'உங்கள் அளவுகோல்களுக்கு மருத்துவமனைகள் கிடைக்கவில்லை',
      noDoctors: 'மருத்துவர்கள் கிடைக்கவில்லை',
      noSlots: 'ஸ்லாட்டுகள் கிடைக்கவில்லை',
      experience: 'அனுபவம்',
      years: 'ஆண்டுகள்',
    },
    payment: {
      title: 'கட்டணம்',
      email: 'மின்னஞ்சல் (விருப்பம்)',
      phone: 'தொலைபேசி எண்',
      transactionId: 'பரிவர்த்தனை ID',
      scanQR: 'செலுத்த UPI QR குறியீட்டை ஸ்கேன் செய்யவும்',
      submit: 'கட்டணத்தை உறுதிப்படுத்து',
      success: 'கட்டணம் வெற்றி!',
      failure: 'கட்டணம் தோல்வி',
    },
    thankYou: {
      title: 'MEDICONNECT ஐ பார்வையிட்டதற்கு நன்றி',
      message: 'உங்கள் சந்திப்பு வெற்றிகரமாக முன்பதிவு செய்யப்பட்டது.',
      quote: '"ஆரோக்கியமே பெரும் செல்வம்."',
      backHome: 'முகப்புக்கு திரும்பு',
    },
    hospitalMenu: {
      title: 'மருத்துவமனைகள்',
      request: 'மருத்துவமனை கோரிக்கை',
      requestDesc: 'MEDICONNECT இல் உங்கள் மருத்துவமனையை பட்டியலிட கோருங்கள்',
      admin: 'சூப்பர் நிர்வாகி',
      adminDesc: 'மருத்துவமனை ஒப்புதல்கள் மற்றும் தளம் அமைப்புகளை நிர்வகிக்கவும்',
    },
    hospitalRequest: {
      title: 'மருத்துவமனை ஆன்போர்டிங் கோரிக்கை',
      hospitalName: 'மருத்துவமனை பெயர்',
      email: 'மருத்துவமனை மின்னஞ்சல்',
      phone: 'தொலைபேசி எண்',
      state: 'மாநிலம்',
      district: 'மாவட்டம்',
      address: 'முழு முகவரி',
      specializations: 'சிறப்புகள்',
      doctors: 'மருத்துவர்கள் (விருப்பம்)',
      upiQr: 'UPI QR குறியீட்டை பதிவேற்றவும்',
      submit: 'கோரிக்கையை சமர்ப்பிக்கவும்',
      success: 'உங்கள் கோரிக்கை சமர்ப்பிக்கப்பட்டது! விரைவில் மதிப்பாய்வு செய்வோம்.',
    },
    admin: {
      login: 'சூப்பர் நிர்வாகி உள்நுழைவு',
      email: 'மின்னஞ்சல்',
      password: 'கடவுச்சொல்',
      loginBtn: 'உள்நுழைக',
      dashboard: 'நிர்வாகி டாஷ்போர்டு',
      pending: 'நிலுவையில்',
      approved: 'ஒப்புக்கொள்ளப்பட்டது',
      rejected: 'நிராகரிக்கப்பட்டது',
      accept: 'ஏற்கவும்',
      deny: 'மறுக்கவும்',
      logout: 'வெளியேறு',
      noRequests: 'மருத்துவமனை கோரிக்கைகள் இல்லை',
    },
    common: { loading: 'ஏற்றுகிறது...', error: 'ஏதோ தவறு நடந்தது', selectOption: 'ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்' },
  },
  kn: {
    nav: { users: 'ಬಳಕೆದಾರರು', hospitals: 'ಆಸ್ಪತ್ರೆಗಳು', info: 'ಮಾಹಿತಿ', home: 'ಮುಖಪುಟ' },
    home: {
      title: 'MEDICONNECT',
      subtitle: 'ಭಾರತದಾದ್ಯಂತ ರೋಗಿಗಳು, ಆಸ್ಪತ್ರೆಗಳು ಮತ್ತು ವಿಮಾ ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸುವ ಸ್ಮಾರ್ಟ್ ವೇದಿಕೆ',
      insurance: 'ವಿಮೆ',
      findHospital: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ',
      insuranceDesc: 'ಆರೋಗ್ಯ ವಿಮಾ ಯೋಜನೆಗಳು, ಕವರೇಜ್ & ಪ್ರಯೋಜನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
      findHospitalDesc: 'ನಿಮ್ಮ ಹತ್ತಿರ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ & ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
    },
    insurance: {
      title: 'ಆರೋಗ್ಯ ವಿಮೆ ಮಾಹಿತಿ',
      types: 'ಆರೋಗ್ಯ ವಿಮೆ ವಿಧಗಳು',
      typesDesc: 'ಭಾರತದಲ್ಲಿ ಲಭ್ಯವಿರುವ ವಿವಿಧ ಆರೋಗ್ಯ ವಿಮಾ ಯೋಜನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
      coverage: 'ಕವರೇಜ್ ವಿವರಗಳು',
      coverageDesc: 'ಆಸ್ಪತ್ರೆ ದಾಖಲಾತಿ, ಮೊದಲು/ನಂತರದ ಆರೈಕೆ, ಆಂಬುಲೆನ್ಸ್',
      benefits: 'ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು',
      benefitsDesc: 'ನಗದುರಹಿತ ಚಿಕಿತ್ಸೆ, 80D ಅಡಿಯಲ್ಲಿ ತೆರಿಗೆ ಪ್ರಯೋಜನಗಳು',
      eligibility: 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು',
      eligibilityDesc: 'ಹೆಚ್ಚಿನ ಯೋಜನೆಗಳಿಗೆ ವಯಸ್ಸು 18-65',
      claimProcess: 'ಕ್ಲೇಮ್ ಪ್ರಕ್ರಿಯೆ',
      claimProcessDesc: 'ನೆಟ್‌ವರ್ಕ್ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ನಗದುರಹಿತ ಕ್ಲೇಮ್‌ಗಳು',
      faqs: 'ಆಗಾಗ್ಗೆ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
      individualHealth: 'ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ವಿಮೆ',
      familyFloater: 'ಕುಟುಂಬ ಫ್ಲೋಟರ್ ಯೋಜನೆಗಳು',
      groupHealth: 'ಗುಂಪು ಆರೋಗ್ಯ ವಿಮೆ',
      criticalIllness: 'ಗಂಭೀರ ಕಾಯಿಲೆ ಕವರ್',
      seniorCitizen: 'ಹಿರಿಯ ನಾಗರಿಕ ಯೋಜನೆಗಳು',
    },
    findHospital: {
      title: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ',
      step1: 'ರೋಗಿ ವಿವರಗಳು',
      step2: 'ಆಸ್ಪತ್ರೆ ಆಯ್ಕೆ',
      step3: 'ವೈದ್ಯರ ಆಯ್ಕೆ',
      step4: 'ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ',
      step5: 'ಪಾವತಿ',
      name: 'ಪೂರ್ಣ ಹೆಸರು',
      age: 'ವಯಸ್ಸು',
      state: 'ರಾಜ್ಯ',
      district: 'ಜಿಲ್ಲೆ',
      healthProblem: 'ಆರೋಗ್ಯ ಸಮಸ್ಯೆ',
      bookingDate: 'ಬುಕಿಂಗ್ ದಿನಾಂಕ',
      next: 'ಮುಂದೆ',
      back: 'ಹಿಂದೆ',
      viewDoctors: 'ವೈದ್ಯರನ್ನು ನೋಡಿ',
      bookSlot: 'ಸ್ಲಾಟ್ ಬುಕ್',
      bookAppointment: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್',
      availableSlots: 'ಲಭ್ಯ ಸ್ಲಾಟ್‌ಗಳು',
      noHospitals: 'ನಿಮ್ಮ ಮಾನದಂಡಗಳಿಗೆ ಆಸ್ಪತ್ರೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      noDoctors: 'ವೈದ್ಯರು ಲಭ್ಯವಿಲ್ಲ',
      noSlots: 'ಲಭ್ಯ ಸ್ಲಾಟ್‌ಗಳಿಲ್ಲ',
      experience: 'ಅನುಭವ',
      years: 'ವರ್ಷಗಳು',
    },
    payment: {
      title: 'ಪಾವತಿ',
      email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
      phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
      transactionId: 'ವ್ಯವಹಾರ ID',
      scanQR: 'ಪಾವತಿಸಲು UPI QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      submit: 'ಪಾವತಿ ದೃಢೀಕರಿಸಿ',
      success: 'ಪಾವತಿ ಯಶಸ್ವಿ!',
      failure: 'ಪಾವತಿ ವಿಫಲ',
    },
    thankYou: {
      title: 'MEDICONNECT ಗೆ ಭೇಟಿ ನೀಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು',
      message: 'ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ.',
      quote: '"ಆರೋಗ್ಯವೇ ಮಹಾ ಭಾಗ್ಯ."',
      backHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    },
    hospitalMenu: {
      title: 'ಆಸ್ಪತ್ರೆಗಳು',
      request: 'ಆಸ್ಪತ್ರೆ ವಿನಂತಿ',
      requestDesc: 'MEDICONNECT ನಲ್ಲಿ ನಿಮ್ಮ ಆಸ್ಪತ್ರೆಯನ್ನು ಪಟ್ಟಿ ಮಾಡಲು ವಿನಂತಿಸಿ',
      admin: 'ಸೂಪರ್ ಅಡ್ಮಿನ್',
      adminDesc: 'ಆಸ್ಪತ್ರೆ ಅನುಮೋದನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    },
    hospitalRequest: {
      title: 'ಆಸ್ಪತ್ರೆ ಆನ್‌ಬೋರ್ಡಿಂಗ್ ವಿನಂತಿ',
      hospitalName: 'ಆಸ್ಪತ್ರೆ ಹೆಸರು',
      email: 'ಆಸ್ಪತ್ರೆ ಇಮೇಲ್',
      phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
      state: 'ರಾಜ್ಯ',
      district: 'ಜಿಲ್ಲೆ',
      address: 'ಪೂರ್ಣ ವಿಳಾಸ',
      specializations: 'ವಿಶೇಷತೆಗಳು',
      doctors: 'ವೈದ್ಯರು (ಐಚ್ಛಿಕ)',
      upiQr: 'UPI QR ಕೋಡ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      submit: 'ವಿನಂತಿ ಸಲ್ಲಿಸಿ',
      success: 'ನಿಮ್ಮ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
    },
    admin: {
      login: 'ಸೂಪರ್ ಅಡ್ಮಿನ್ ಲಾಗಿನ್',
      email: 'ಇಮೇಲ್',
      password: 'ಪಾಸ್‌ವರ್ಡ್',
      loginBtn: 'ಲಾಗಿನ್',
      dashboard: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      pending: 'ಬಾಕಿ',
      approved: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
      rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
      accept: 'ಒಪ್ಪಿಕೊಳ್ಳಿ',
      deny: 'ನಿರಾಕರಿಸಿ',
      logout: 'ಲಾಗ್‌ಔಟ್',
      noRequests: 'ಆಸ್ಪತ್ರೆ ವಿನಂತಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    },
    common: { loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', error: 'ಏನೋ ತಪ್ಪಾಗಿದೆ', selectOption: 'ಒಂದು ಆಯ್ಕೆ ಆರಿಸಿ' },
  },
  ml: {
    nav: { users: 'ഉപയോക്താക്കൾ', hospitals: 'ആശുപത്രികൾ', info: 'വിവരങ്ങൾ', home: 'ഹോം' },
    home: {
      title: 'MEDICONNECT',
      subtitle: 'ഇന്ത്യയിലുടനീളം രോഗികളെ, ആശുപത്രികളെ, ഇൻഷുറൻസ് സേവനങ്ങളെ ബന്ധിപ്പിക്കുന്ന സ്മാർട്ട് പ്ലാറ്റ്‌ഫോം',
      insurance: 'ഇൻഷുറൻസ്',
      findHospital: 'ആശുപത്രി കണ്ടെത്തുക',
      insuranceDesc: 'ആരോഗ്യ ഇൻഷുറൻസ് പ്ലാനുകൾ, കവറേജ് & ആനുകൂല്യങ്ങൾ പര്യവേക്ഷണം ചെയ്യുക',
      findHospitalDesc: 'നിങ്ങളുടെ സമീപത്തുള്ള ആശുപത്രികൾ തിരയുക & അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
    },
    insurance: {
      title: 'ആരോഗ്യ ഇൻഷുറൻസ് വിവരങ്ങൾ',
      types: 'ആരോഗ്യ ഇൻഷുറൻസ് തരങ്ങൾ',
      typesDesc: 'ഇന്ത്യയിൽ ലഭ്യമായ വിവിധ ആരോഗ്യ ഇൻഷുറൻസ് പ്ലാനുകൾ മനസ്സിലാക്കുക',
      coverage: 'കവറേജ് വിശദാംശങ്ങൾ',
      coverageDesc: 'ആശുപത്രിയിൽ പ്രവേശനം, മുമ്പ്/ശേഷം പരിചരണം, ആംബുലൻസ്',
      benefits: 'പ്രധാന ആനുകൂല്യങ്ങൾ',
      benefitsDesc: 'ക്യാഷ്‌ലെസ് ചികിത്സ, 80D പ്രകാരം നികുതി ആനുകൂല്യങ്ങൾ',
      eligibility: 'യോഗ്യതാ മാനദണ്ഡങ്ങൾ',
      eligibilityDesc: 'മിക്ക പ്ലാനുകൾക്കും പ്രായം 18-65',
      claimProcess: 'ക്ലെയിം പ്രക്രിയ',
      claimProcessDesc: 'നെറ്റ്‌വർക്ക് ആശുപത്രികളിൽ ക്യാഷ്‌ലെസ് ക്ലെയിമുകൾ',
      faqs: 'പതിവ് ചോദ്യങ്ങൾ',
      individualHealth: 'വ്യക്തിഗത ആരോഗ്യ ഇൻഷുറൻസ്',
      familyFloater: 'ഫാമിലി ഫ്ലോട്ടർ പ്ലാനുകൾ',
      groupHealth: 'ഗ്രൂപ്പ് ആരോഗ്യ ഇൻഷുറൻസ്',
      criticalIllness: 'ഗുരുതര രോഗ കവർ',
      seniorCitizen: 'മുതിർന്ന പൗരൻ പ്ലാനുകൾ',
    },
    findHospital: {
      title: 'ആശുപത്രി കണ്ടെത്തുക',
      step1: 'രോഗി വിശദാംശങ്ങൾ',
      step2: 'ആശുപത്രി തിരഞ്ഞെടുക്കുക',
      step3: 'ഡോക്ടർ തിരഞ്ഞെടുക്കുക',
      step4: 'സ്ലോട്ട് ബുക്ക് ചെയ്യുക',
      step5: 'പേയ്മെന്റ്',
      name: 'പൂർണ്ണ നാമം',
      age: 'പ്രായം',
      state: 'സംസ്ഥാനം',
      district: 'ജില്ല',
      healthProblem: 'ആരോഗ്യ പ്രശ്നം',
      bookingDate: 'ബുക്കിംഗ് തീയതി',
      next: 'അടുത്തത്',
      back: 'പിന്നിലേക്ക്',
      viewDoctors: 'ഡോക്ടർമാരെ കാണുക',
      bookSlot: 'സ്ലോട്ട് ബുക്ക്',
      bookAppointment: 'അപ്പോയിന്റ്മെന്റ് ബുക്ക്',
      availableSlots: 'ലഭ്യമായ സ്ലോട്ടുകൾ',
      noHospitals: 'നിങ്ങളുടെ മാനദണ്ഡങ്ങൾക്ക് ആശുപത്രികൾ കണ്ടെത്തിയില്ല',
      noDoctors: 'ഡോക്ടർമാർ ലഭ്യമല്ല',
      noSlots: 'ലഭ്യമായ സ്ലോട്ടുകൾ ഇല്ല',
      experience: 'അനുഭവം',
      years: 'വർഷങ്ങൾ',
    },
    payment: {
      title: 'പേയ്മെന്റ്',
      email: 'ഇമെയിൽ (ഐച്ഛികം)',
      phone: 'ഫോൺ നമ്പർ',
      transactionId: 'ഇടപാട് ID',
      scanQR: 'പണമടയ്ക്കാൻ UPI QR കോഡ് സ്കാൻ ചെയ്യുക',
      submit: 'പേയ്മെന്റ് സ്ഥിരീകരിക്കുക',
      success: 'പേയ്മെന്റ് വിജയകരം!',
      failure: 'പേയ്മെന്റ് പരാജയം',
    },
    thankYou: {
      title: 'MEDICONNECT സന്ദർശിച്ചതിന് നന്ദി',
      message: 'നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് വിജയകരമായി ബുക്ക് ചെയ്തു.',
      quote: '"ആരോഗ്യമാണ് ഏറ്റവും വലിയ സമ്പത്ത്."',
      backHome: 'ഹോമിലേക്ക് മടങ്ങുക',
    },
    hospitalMenu: {
      title: 'ആശുപത്രികൾ',
      request: 'ആശുപത്രി അഭ്യർത്ഥന',
      requestDesc: 'MEDICONNECT ൽ നിങ്ങളുടെ ആശുപത്രി ലിസ്റ്റ് ചെയ്യാൻ അഭ്യർത്ഥിക്കുക',
      admin: 'സൂപ്പർ അഡ്മിൻ',
      adminDesc: 'ആശുപത്രി അംഗീകാരങ്ങളും പ്ലാറ്റ്‌ഫോം ക്രമീകരണങ്ങളും നിയന്ത്രിക്കുക',
    },
    hospitalRequest: {
      title: 'ആശുപത്രി ഓൺബോർഡിംഗ് അഭ്യർത്ഥന',
      hospitalName: 'ആശുപത്രിയുടെ പേര്',
      email: 'ആശുപത്രി ഇമെയിൽ',
      phone: 'ഫോൺ നമ്പർ',
      state: 'സംസ്ഥാനം',
      district: 'ജില്ല',
      address: 'പൂർണ്ണ വിലാസം',
      specializations: 'സ്പെഷ്യാലിറ്റികൾ',
      doctors: 'ഡോക്ടർമാർ (ഐച്ഛികം)',
      upiQr: 'UPI QR കോഡ് അപ്‌ലോഡ് ചെയ്യുക',
      submit: 'അഭ്യർത്ഥന സമർപ്പിക്കുക',
      success: 'നിങ്ങളുടെ അഭ്യർത്ഥന സമർപ്പിച്ചു!',
    },
    admin: {
      login: 'സൂപ്പർ അഡ്മിൻ ലോഗിൻ',
      email: 'ഇമെയിൽ',
      password: 'പാസ്‌വേഡ്',
      loginBtn: 'ലോഗിൻ',
      dashboard: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
      pending: 'തീർപ്പാക്കാത്ത',
      approved: 'അംഗീകരിച്ചു',
      rejected: 'നിരസിച്ചു',
      accept: 'അംഗീകരിക്കുക',
      deny: 'നിരസിക്കുക',
      logout: 'ലോഗ്ഔട്ട്',
      noRequests: 'ആശുപത്രി അഭ്യർത്ഥനകൾ കണ്ടെത്തിയില്ല',
    },
    common: { loading: 'ലോഡ് ചെയ്യുന്നു...', error: 'എന്തോ തകരാറുണ്ടായി', selectOption: 'ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക' },
  },
};
