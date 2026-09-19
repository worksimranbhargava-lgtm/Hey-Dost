// Emergency Distress Detection and Dispatch Utility

const EMERGENCY_TRIGGERS = [
  'heart attack',
  'chest pain',
  'cant breathe',
  "can't breathe",
  'cannot breathe',
  'fell down',
  'fallen down',
  'cant get up',
  "can't get up",
  'cannot get up',
  'need help right now',
  'call an ambulance',
  'call 112',
  'call 108',
  'call 102',
  'dying',
  'saans nahi',
  'chhati mein dard',
  'gir gaya',
  'gir gayi',
  'uth nahi pa raha',
  'uth nahi pa rahi',
  'dil ka daura',
  'chakkar aa raha',
  'madad chahiye abhi',
  'stroke',
  'unconscious',
];

export function isEmergencyDistress(text: string): boolean {
  const normalized = text.toLowerCase().replace(/['".,!?-]/g, ' ');
  return EMERGENCY_TRIGGERS.some(trigger => normalized.includes(trigger));
}

export interface EmergencyPayload {
  userName: string;
  originalStatement: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    mapsUrl: string;
  };
}

export function buildEmergencyAlertMessage(
  userName: string,
  userStatement: string,
  locationText?: string
): string {
  const name = userName ? userName : 'Your family member';
  let msg = `EMERGENCY ALERT: ${name} may need immediate assistance. They said: "${userStatement}". They confirmed they are not okay and need urgent help.`;
  if (locationText) {
    msg += ` Location: ${locationText}`;
  }
  msg += ` Please check on them immediately.`;
  return msg;
}
