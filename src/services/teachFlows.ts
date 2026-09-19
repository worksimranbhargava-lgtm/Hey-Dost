import type { TeachFlow } from '../types';

export const TEACH_FLOWS: Record<string, TeachFlow> = {
  whatsapp_photo: {
    id: 'whatsapp_photo',
    title: 'Send a Photo on WhatsApp',
    titleHi: 'WhatsApp पर फोटो भेजें',
    titleHinglish: 'WhatsApp pe Photo Bhejo',
    steps: [
      {
        id: 1,
        instruction: 'First, open WhatsApp. Look for the green icon on your home screen.',
        instructionHi: 'सबसे पहले WhatsApp खोलें। अपने home screen पर हरा icon ढूंढें।',
        instructionHinglish: 'Sabse pehle WhatsApp kholiye. Home screen par WhatsApp ka green icon dhoondhiye.',
        target: 'Green WhatsApp icon',
        actionHint: 'Green circle with white phone symbol inside',
        navigationTip: 'If you are inside another app, press the Home button at the bottom of your phone first.',
        completed: false,
      },
      {
        id: 2,
        instruction: 'Find and tap the name of the person you want to send the photo to.',
        instructionHi: 'जिसे फोटो भेजनी है, सूची में उनके नाम पर tap करें।',
        instructionHinglish: 'Jisko photo bhejna hai, chat list mein unka naam dhoondh kar tap kijiye.',
        target: 'Person contact name',
        actionHint: 'Tap once on their name in the chat list',
        navigationTip: 'If you cannot find them, look for the magnifying glass at the top right to search.',
        completed: false,
      },
      {
        id: 3,
        instruction: 'Look at the bottom near the typing bar. Tap the small paperclip or "+" icon.',
        instructionHi: 'नीचे message box के पास paperclip या "+" icon देखें और दबाएं।',
        instructionHinglish: 'Neeche message box ke paas paperclip ya "+" icon dekhiye aur tap kijiye.',
        target: 'Paperclip / Plus (+) icon',
        actionHint: 'Located right next to the message typing box',
        navigationTip: 'Tap gently on the icon once. A small popup menu will appear.',
        completed: false,
      },
      {
        id: 4,
        instruction: 'In the menu that pops up, tap on "Gallery" or "Photos".',
        instructionHi: 'खुले menu में "Gallery" या "Photos" विकल्प दबाएं।',
        instructionHinglish: 'Pop-up menu mein se "Gallery" ya "Photos" par tap kijiye.',
        target: 'Gallery icon (purple or multi-colored square)',
        actionHint: 'Tap the purple Gallery icon',
        navigationTip: 'If you pressed the wrong button, press Back at the bottom to return.',
        completed: false,
      },
      {
        id: 5,
        instruction: 'Browse and tap the exact photo you wish to send.',
        instructionHi: 'अपनी फोटो देखें और जिसे भेजना है उस पर tap करें।',
        instructionHinglish: 'Jo photo bhejna chahte hain, us photo par ek baar tap kijiye.',
        target: 'Your desired photograph',
        actionHint: 'Tapping opens the full-screen photo preview',
        navigationTip: 'You can scroll down slowly to find older photos.',
        completed: false,
      },
      {
        id: 6,
        instruction: 'Look at the bottom-right corner. Tap the green or blue circle with the white arrow to Send.',
        instructionHi: 'नीचे दाईं तरफ सफेद तीर वाला Send button दबाएं।',
        instructionHinglish: 'Screen ke neeche daayein kone mein Send arrow wala button dabaiye.',
        target: 'Send button (circular arrow icon)',
        actionHint: 'Circular button with white paper plane or arrow',
        navigationTip: 'Once tapped, your photo is safely sent to your friend!',
        completed: false,
      },
    ],
  },

  make_call: {
    id: 'make_call',
    title: 'Make a Phone Call',
    titleHi: 'Phone Call करें',
    titleHinglish: 'Phone Call Karo',
    steps: [
      {
        id: 1,
        instruction: 'Open the Phone app. It usually looks like a green handset receiver.',
        instructionHi: 'Phone app खोलें। यह आमतौर पर हरे रंग का handset icon होता है।',
        instructionHinglish: 'Home screen par Phone app ka green handset icon dhoondhiye aur kholiye.',
        target: 'Phone dialer icon',
        actionHint: 'Tap the green phone handset icon on your bottom bar',
        navigationTip: 'Press Home button first if you are currently in another app.',
        completed: false,
      },
      {
        id: 2,
        instruction: 'Tap on "Contacts" at the bottom or search the person\'s name.',
        instructionHi: 'नीचे "Contacts" पर tap करें या उनका नाम खोजें।',
        instructionHinglish: 'Neeche "Contacts" tab par tap kijiye ya unka naam search kijiye.',
        target: 'Contacts tab or search bar',
        actionHint: 'Tap Contacts or the search bar at the top',
        navigationTip: 'Scroll slowly through alphabetical names.',
        completed: false,
      },
      {
        id: 3,
        instruction: 'Tap their name once to open their contact card.',
        instructionHi: 'उनके नाम पर एक बार tap करें।',
        instructionHinglish: 'Unke naam par ek baar tap kijiye.',
        target: 'Person contact card',
        actionHint: 'Opens details showing their phone number',
        navigationTip: 'If the wrong person opens, press the Back arrow on top left.',
        completed: false,
      },
      {
        id: 4,
        instruction: 'Tap the green Call icon next to their phone number to begin ringing.',
        instructionHi: 'नंबर के पास हरे Phone icon को दबाएं।',
        instructionHinglish: 'Number ke paas green call icon par tap kijiye.',
        target: 'Green call button',
        actionHint: 'The phone will now start ringing',
        navigationTip: 'Hold phone to your ear or tap "Speaker" to talk on loudspeaker.',
        completed: false,
      },
    ],
  },

  video_call: {
    id: 'video_call',
    title: 'Make a Video Call on WhatsApp',
    titleHi: 'WhatsApp Video Call करें',
    titleHinglish: 'WhatsApp Video Call Karo',
    steps: [
      {
        id: 1,
        instruction: 'Open WhatsApp and tap into the conversation with the person you want to see.',
        instructionHi: 'WhatsApp खोलें और जिसे video call करनी है उनकी chat में जाएं।',
        instructionHinglish: 'WhatsApp kholiye aur unki chat kholiye jinse video call karni hai.',
        target: 'WhatsApp chat conversation',
        actionHint: 'Tap their name in the chats tab',
        navigationTip: 'Make sure your Wi-Fi or mobile data is turned on for clear video.',
        completed: false,
      },
      {
        id: 2,
        instruction: 'Look at the very top-right corner of the screen. Look for the small video camera icon.',
        instructionHi: 'स्क्रीन के सबसे ऊपर-दाईं तरफ छोटा video camera icon देखें।',
        instructionHinglish: 'Screen ke sabse upar-daayein kone mein video camera icon dhoondhiye.',
        target: 'Video camera icon (top-right corner)',
        actionHint: 'Located right next to the regular phone call icon',
        navigationTip: 'Be careful not to press the three dots next to it.',
        completed: false,
      },
      {
        id: 3,
        instruction: 'Tap the video camera icon. If asked "Start video call?", tap Call.',
        instructionHi: 'Video camera icon दबाएं और Call पर tap करें।',
        instructionHinglish: 'Video camera icon par tap kijiye aur Call dabaiye.',
        target: 'Start Call confirmation',
        actionHint: 'Your camera will turn on and display your face',
        navigationTip: 'Hold phone upright in front of your face with good room lighting.',
        completed: false,
      },
    ],
  },

  google_maps: {
    id: 'google_maps',
    title: 'Find Directions on Google Maps',
    titleHi: 'Google Maps पर रास्ता खोजें',
    titleHinglish: 'Google Maps Par Rasta Dhoondho',
    steps: [
      {
        id: 1,
        instruction: 'Open Google Maps. Look for the colorful folded map pin icon.',
        instructionHi: 'Google Maps खोलें। रंग-बिरंगा map pin icon ढूंढें।',
        instructionHinglish: 'Google Maps app kholiye. Map pin wala colorful icon dhoondhiye.',
        target: 'Google Maps icon',
        actionHint: 'Tap Maps app on your phone home screen',
        navigationTip: 'If GPS location popup appears, tap "While using app" or "Allow".',
        completed: false,
      },
      {
        id: 2,
        instruction: 'Tap the Search bar at the top of the screen.',
        instructionHi: 'स्क्रीन के ऊपर Search bar पर tap करें।',
        instructionHinglish: 'Upar Search bar par tap kijiye.',
        target: 'Search here bar',
        actionHint: 'Type destination or tap microphone to speak place name',
        navigationTip: 'You can speak: "Apollo Hospital" or "Railway Station".',
        completed: false,
      },
      {
        id: 3,
        instruction: 'Tap the blue "Directions" button at the bottom.',
        instructionHi: 'नीचे नीले "Directions" button पर tap करें।',
        instructionHinglish: 'Neeche blue "Directions" button par tap kijiye.',
        target: 'Blue Directions button',
        actionHint: 'Shows time and route line on the map',
        navigationTip: 'Tap "Start" to hear voice-guided turn-by-turn navigation.',
        completed: false,
      },
    ],
  },
};

export function getFlowForQuery(text: string): TeachFlow | null {
  const t = text.toLowerCase();

  if (
    (t.includes('whatsapp') || t.includes('photo') || t.includes('image') || t.includes('tasveer')) &&
    (t.includes('send') || t.includes('bhej') || t.includes('sikhao') || t.includes('teach') || t.includes('share'))
  ) {
    return TEACH_FLOWS.whatsapp_photo;
  }

  if (
    (t.includes('video call') || t.includes('video kaise')) &&
    (t.includes('whatsapp') || t.includes('call') || t.includes('karna'))
  ) {
    return TEACH_FLOWS.video_call;
  }

  if (
    (t.includes('call') || t.includes('phone call') || t.includes('dial')) &&
    !t.includes('video')
  ) {
    return TEACH_FLOWS.make_call;
  }

  if (
    t.includes('map') ||
    t.includes('rasta') ||
    t.includes('directions') ||
    t.includes('location dhoondh')
  ) {
    return TEACH_FLOWS.google_maps;
  }

  // Fallback dynamic generator if user asks to learn anything else
  if (t.includes('sikhao') || t.includes('teach me') || t.includes('kaise karein') || t.includes('how do i')) {
    return {
      id: 'custom_guided',
      title: `Learning: ${text}`,
      titleHi: `सीखना: ${text}`,
      titleHinglish: `Seekhna: ${text}`,
      steps: [
        {
          id: 1,
          instruction: 'Step 1: Make sure your phone screen is unlocked and return to the Home screen.',
          instructionHi: 'चरण 1: अपने phone का lock खोलें और Home screen पर आएं।',
          instructionHinglish: 'Step 1: Phone ka lock khol kar Home screen par aayein.',
          target: 'Home Screen',
          actionHint: 'Press the central circle or Home button at the bottom',
          navigationTip: 'Take a deep breath. We will go one calm step at a time.',
          completed: false,
        },
        {
          id: 2,
          instruction: 'Step 2: Find the main app icon related to what you need and tap gently once.',
          instructionHi: 'चरण 2: संबंधित app का icon ढूंढें और धीरे से एक बार tap करें।',
          instructionHinglish: 'Step 2: App ka icon dhoondhein aur dheere se ek baar tap karein.',
          target: 'App icon',
          actionHint: 'Tap gently on the icon',
          navigationTip: 'If the wrong app opens, press Back button at the bottom.',
          completed: false,
        },
        {
          id: 3,
          instruction: 'Step 3: Follow the on-screen prompt carefully, or tap Help if you feel unsure.',
          instructionHi: 'चरण 3: स्क्रीन पर लिखे निर्देशों का पालन करें।',
          instructionHinglish: 'Step 3: Screen par diye gaye instructions ko follow kijiye.',
          target: 'Action button',
          actionHint: 'Tap the primary action button',
          navigationTip: 'Dost is right here with you throughout.',
          completed: false,
        },
      ],
    };
  }

  return null;
}
