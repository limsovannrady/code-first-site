import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sun, Moon } from 'lucide-react';

interface Note {
  id: number;
  text: string;
  createdAt: {
    iso: string;
    khmerFull: string;
  };
}

const DailyNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, noteId: null as number | null });
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null);

  // Khmer Date & Time Localization
  const getKhmerDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Phnom_Penh',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };

    const formatter = new Intl.DateTimeFormat('km-KH', options);
    const formattedParts = formatter.formatToParts(now);

    let weekday = '';
    let month = '';
    let day = '';
    let year = '';
    let hour = '';
    let minute = '';
    let ampm = '';

    for (const part of formattedParts) {
      switch (part.type) {
        case 'weekday': weekday = part.value; break;
        case 'month': month = part.value; break;
        case 'day': day = part.value; break;
        case 'year': year = part.value; break;
        case 'hour': hour = part.value; break;
        case 'minute': minute = part.value; break;
        case 'dayPeriod': ampm = part.value; break;
      }
    }

    const convertToKhmerNumerals = (num: string) => {
      const numeralsMap: { [key: string]: string } = { 
        '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤', 
        '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩' 
      };
      return String(num).split('').map(digit => numeralsMap[digit] || digit).join('');
    };

    const khmerNumeralsDay = convertToKhmerNumerals(day);
    const khmerNumeralsYear = convertToKhmerNumerals(year);
    const khmerNumeralsHour = convertToKhmerNumerals(hour);
    const khmerNumeralsMinute = convertToKhmerNumerals(minute);

    let khmerAMPM = '';
    const hourNum = parseInt(hour);
    if (ampm.includes('PM') && hourNum >= 18) {
      khmerAMPM = 'ល្ងាច';
    } else if (ampm.includes('AM') && hourNum >= 5) {
      khmerAMPM = 'ព្រឹក';
    } else if (ampm.includes('AM')) {
      khmerAMPM = 'យប់';
    } else if (ampm.includes('PM') && hourNum < 18) {
      khmerAMPM = 'រសៀល';
    }

    const khmerTime = `${khmerNumeralsHour}:${khmerNumeralsMinute} ${khmerAMPM}`;
    const khmerDate = `${weekday} ទី${khmerNumeralsDay} ខែ${month} ឆ្នាំ ${khmerNumeralsYear}`;
    const khmerFullDate = `កំណត់ចំណាំអត្រាប្រចាំថ្ងៃ - ${weekday} ទី${khmerNumeralsDay} ខែ${month} ឆ្នាំ${khmerNumeralsYear} ម៉ោង ${khmerTime} កន្លែងម៉ោង Phnom Penh`;

    return { khmerTime, khmerDate, khmerFullDate };
  };

  // LocalStorage functions
  const getNotes = (): Note[] => {
    const stored = localStorage.getItem('daily-notes-kh');
    return stored ? JSON.parse(stored) : [];
  };

  const saveNotes = (newNotes: Note[]) => {
    localStorage.setItem('daily-notes-kh', JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    
    const allNotes = getNotes();
    const { khmerDate, khmerTime } = getKhmerDateTime();
    const newNote: Note = {
      id: Date.now(),
      text: noteText.trim(),
      createdAt: {
        iso: new Date().toISOString(),
        khmerFull: `ថ្ងៃទី ${khmerDate} ម៉ោង ${khmerTime} កន្លែងម៉ោង Phnom Penh`
      }
    };
    
    const updatedNotes = [newNote, ...allNotes];
    saveNotes(updatedNotes);
    setNoteText('');
  };

  const deleteNote = (id: number) => {
    const allNotes = getNotes();
    const updatedNotes = allNotes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    setDeleteModal({ open: false, noteId: null });
  };

  const copyNote = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(note.text);
      setCopiedNoteId(note.id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    // Initialize
    const { khmerFullDate } = getKhmerDateTime();
    setCurrentDate(khmerFullDate);
    setNotes(getNotes());
    
    // Load theme
    const storedTheme = localStorage.getItem('theme');
    const darkMode = storedTheme === 'dark';
    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <header className="text-center py-6 mb-8 border-b-2 border-border relative">
          <h1 className="text-4xl font-bold mb-2 text-foreground">កំណត់ចំណាំប្រចាំថ្ងៃ</h1>
          <p className="text-lg text-muted-foreground font-light">{currentDate}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4 rounded-full hover:bg-muted"
            aria-label="ប្តូររបៀបពន្លឺ/ងងឹត"
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="ស្វែងរកកំណត់ចំណាំ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-card border-border shadow-sm focus:ring-primary"
          />
        </div>

        {/* Note Creation Form */}
        <Card className="mb-8 p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">បង្កើតកំណត់ចំណាំថ្មី</h2>
          <Textarea
            rows={4}
            placeholder="សូមវាយកំណត់ចំណាំរបស់អ្នក..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full mb-4 rounded-xl bg-muted border-border focus:ring-primary"
          />
          <Button
            onClick={addNote}
            className="w-full rounded-xl btn-3d text-primary-foreground font-bold hover:opacity-90"
            style={{ background: 'var(--gradient-primary)' }}
            aria-label="បន្ថែមកំណត់ចំណាំថ្មី"
          >
            បន្ថែម
          </Button>
        </Card>

        {/* Notes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length === 0 ? (
            <p className="text-center col-span-full py-10 text-muted-foreground">
              មិនទាន់មានកំណត់ចំណាំនៅឡើយទេ។
            </p>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="card-hover p-5 rounded-2xl shadow-md fade-in flex flex-col justify-between">
                <div>
                  <p className="text-md mb-4 whitespace-pre-wrap text-card-foreground">{note.text}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-4">{note.createdAt.khmerFull}</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => copyNote(note)}
                      className="w-1/2 rounded-xl btn-3d"
                      aria-label="ចម្លងកំណត់ចំណាំ"
                    >
                      {copiedNoteId === note.id ? 'ចម្លងហើយ!' : 'កូពី'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteModal({ open: true, noteId: note.id })}
                      className="w-1/2 rounded-xl hover:bg-destructive/90 transition-colors"
                      aria-label="លុបកំណត់ចំណាំ"
                    >
                      លុប
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Deletion Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, noteId: null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">បញ្ជាក់ការលុប</DialogTitle>
            <DialogDescription className="text-center">
              តើអ្នកប្រាកដថាចង់លុបមែនទេ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ open: false, noteId: null })}
              className="rounded-xl"
              aria-label="បោះបង់ការលុប"
            >
              បោះបង់
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteModal.noteId && deleteNote(deleteModal.noteId)}
              className="rounded-xl"
              aria-label="បញ្ជាក់ការលុប"
            >
              លុប
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyNotes;