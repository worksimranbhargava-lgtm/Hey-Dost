import React, { useState } from 'react';
import type { Reminder } from '../types';
import { useApp } from '../context/AppContext';

export const MyDayPage: React.FC = () => {
  const { reminders, addReminder, deleteReminder, toggleReminder, profile, activeLanguage } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');

  const L = activeLanguage;

  const t = {
    title: L === 'hi' ? 'मेरा दिन' : L === 'hinglish' ? 'Mera Din' : 'My Day',
    subtitle: L === 'hi' ? 'आपके reminders और tasks' : L === 'hinglish' ? 'Aapke reminders aur tasks' : 'Your reminders & tasks',
    empty: L === 'hi' ? 'आपका दिन खाली है।' : L === 'hinglish' ? 'Aapka din clear hai.' : 'Your day is clear.',
    addQ: L === 'hi' ? 'कुछ जोड़ना चाहेंगे?' : L === 'hinglish' ? 'Kuch add karna chahoge?' : 'Would you like to add something?',
    add: L === 'hi' ? 'जोड़ें' : L === 'hinglish' ? 'Add Karo' : 'Add',
    cancel: L === 'hi' ? 'रद्द करें' : 'Cancel',
    placeholder: L === 'hi' ? 'Reminder क्या है?' : L === 'hinglish' ? 'Kya yaad dilana hai?' : 'What do you want to remember?',
    save: L === 'hi' ? 'सेव करें' : L === 'hinglish' ? 'Save Karo' : 'Save',
    today: 'Today',
    upcoming: 'Upcoming',
  };

  const handleAdd = () => {
    if (!newText.trim()) return;
    addReminder({
      text: newText.trim(),
      time: newTime || undefined,
      date: newDate || undefined,
      repeat: 'none',
      completed: false,
    });
    setNewText('');
    setNewTime('');
    setNewDate('');
    setShowAdd(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReminders = reminders.filter(r => !r.date || r.date === todayStr);
  const upcomingReminders = reminders.filter(r => r.date && r.date > todayStr);

  const ReminderCard = ({ r }: { r: Reminder }) => (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      border: r.completed ? '1.5px solid #D1FAE5' : '1.5px solid #F3F4F6',
      opacity: r.completed ? 0.7 : 1,
    }}>
      <button
        onClick={() => toggleReminder(r.id)}
        style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: r.completed ? '#1B8A6B' : '#fff',
          border: `2px solid ${r.completed ? '#1B8A6B' : '#D1D5DB'}`,
          cursor: 'pointer', fontSize: 14, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 2,
        }}
      >
        {r.completed ? '✓' : ''}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 17, color: '#111827', fontWeight: 500,
          textDecoration: r.completed ? 'line-through' : 'none',
          lineHeight: 1.4,
        }}>
          {r.text}
        </div>
        {(r.time || r.date) && (
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            {r.date && r.date !== todayStr ? `📅 ${new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ` : ''}
            {r.time ? `⏰ ${r.time}` : ''}
          </div>
        )}
      </div>
      <button
        onClick={() => deleteReminder(r.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, color: '#D1D5DB', padding: 4, flexShrink: 0,
        }}
        aria-label="Delete"
      >
        🗑
      </button>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{
        padding: '20px 20px 12px',
        background: '#FAFAF8',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
            📅 {t.title}
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '10px 18px', fontSize: 15, fontWeight: 600,
            background: '#1B8A6B', color: '#fff',
            border: 'none', borderRadius: 12, cursor: 'pointer',
          }}
        >
          + {t.add}
        </button>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Add reminder form */}
        {showAdd && (
          <div style={{
            background: '#F0FDF4', border: '1.5px solid #BBF7D0',
            borderRadius: 20, padding: '20px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1B8A6B', margin: 0 }}>
              {profile.language === 'hi' ? 'नया Reminder' : profile.language === 'hinglish' ? 'Naya Reminder' : 'New Reminder'}
            </p>
            <input
              autoFocus
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder={t.placeholder}
              style={{
                fontSize: 16, padding: '14px 16px',
                borderRadius: 12, border: '1.5px solid #BBF7D0',
                outline: 'none', background: '#fff', color: '#111827',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>TIME</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{
                    width: '100%', fontSize: 16, padding: '10px 12px',
                    borderRadius: 10, border: '1.5px solid #E5E7EB',
                    outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>DATE</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  style={{
                    width: '100%', fontSize: 16, padding: '10px 12px',
                    borderRadius: 10, border: '1.5px solid #E5E7EB',
                    outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleAdd}
                disabled={!newText.trim()}
                style={{
                  flex: 2, padding: '14px',
                  fontSize: 16, fontWeight: 700,
                  background: newText.trim() ? '#1B8A6B' : '#D1D5DB', color: '#fff',
                  border: 'none', borderRadius: 12, cursor: newText.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                ✓ {t.save}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  flex: 1, padding: '14px',
                  fontSize: 15, background: '#fff', color: '#6B7280',
                  border: '1px solid #E5E7EB', borderRadius: 12, cursor: 'pointer',
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Today's reminders */}
        {todayReminders.length > 0 && (
          <div>
            <h3 style={{ fontSize: 14, color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t.today}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayReminders.map(r => <ReminderCard key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {/* Upcoming reminders */}
        {upcomingReminders.length > 0 && (
          <div>
            <h3 style={{ fontSize: 14, color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t.upcoming}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingReminders.map(r => <ReminderCard key={r.id} r={r} />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {reminders.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>☀️</div>
            <p style={{ fontSize: 18, fontWeight: 500, color: '#374151', margin: 0 }}>{t.empty}</p>
            <p style={{ fontSize: 15, marginTop: 8 }}>{t.addQ}</p>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                marginTop: 20, padding: '14px 28px',
                fontSize: 16, fontWeight: 600,
                background: '#1B8A6B', color: '#fff',
                border: 'none', borderRadius: 14, cursor: 'pointer',
              }}
            >
              + {t.add}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
