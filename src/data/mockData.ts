import { Match, Team } from '../types';

export const INITIAL_MATCHES: Match[] = [
  {
    matchId: 'M1001',
    team1Name: 'RCB',
    team2Name: 'CSK',
    runs: 186,
    wickets: 4,
    overs: 18.3,
    status: 'LIVE',
    summary: 'Batting side is building pressure nicely with explosive boundaries in death overs.',
    currentInning: '1st Inning',
    recentBalls: ['1', '4', '6', '0', '2', 'W', '1'],
    lastUpdated: 'Just now'
  },
  {
    matchId: 'M1002',
    team1Name: 'IND',
    team2Name: 'AUS',
    runs: 142,
    wickets: 7,
    overs: 17.0,
    status: 'IN PROGRESS',
    summary: 'Middle order collapse. Spinners dominating the second session with sharp turn.',
    currentInning: '2nd Inning',
    target: 185,
    recentBalls: ['0', '1', 'W', '0', '1', '1'],
    lastUpdated: '5 mins ago'
  },
  {
    matchId: 'M1003',
    team1Name: 'SRH',
    team2Name: 'MI',
    runs: 201,
    wickets: 6,
    overs: 20.0,
    status: 'COMPLETED',
    summary: 'SRH won by 14 runs in a high scoring thriller at Rajiv Gandhi Stadium.',
    currentInning: 'Match Ended',
    target: 202,
    recentBalls: ['1', '6', '4', 'W', '1', '2'],
    lastUpdated: '1 hour ago'
  },
  {
    matchId: 'M1004',
    team1Name: 'KKR',
    team2Name: 'DC',
    runs: 165,
    wickets: 5,
    overs: 19.1,
    status: 'LIVE',
    summary: 'Tight run chase underway! Required run rate is 9.5 with 3 wickets in hand.',
    currentInning: '2nd Inning',
    target: 172,
    recentBalls: ['2', '4', '1', '1', '6', '1'],
    lastUpdated: '2 mins ago'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Hyderabad Titans',
    captainName: 'Arfaz Mohammad',
    city: 'Hyderabad',
    players: [
      { id: 'p1', name: 'Arfaz Mohammad', jerseyNumber: 7, role: 'All-Rounder', runsScored: 342, wicketsTaken: 14 },
      { id: 'p2', name: 'Rahul Varma', jerseyNumber: 18, role: 'Batsman', runsScored: 410, wicketsTaken: 0 },
      { id: 'p3', name: 'Syed Imran', jerseyNumber: 99, role: 'Bowler', runsScored: 45, wicketsTaken: 22 },
      { id: 'p4', name: 'Karthik Reddy', jerseyNumber: 23, role: 'Wicketkeeper', runsScored: 280, wicketsTaken: 0 },
      { id: 'p5', name: 'Manoj Kumar', jerseyNumber: 11, role: 'Bowler', runsScored: 30, wicketsTaken: 18 },
      { id: 'p6', name: 'Praveen Sharma', jerseyNumber: 45, role: 'Batsman', runsScored: 310, wicketsTaken: 2 }
    ]
  },
  {
    id: '2',
    name: 'Bangalore Blasters',
    captainName: 'Vikram Singh',
    city: 'Bengaluru',
    players: [
      { id: 'p7', name: 'Vikram Singh', jerseyNumber: 10, role: 'Batsman', runsScored: 520, wicketsTaken: 1 },
      { id: 'p8', name: 'Siddharth Rao', jerseyNumber: 8, role: 'All-Rounder', runsScored: 290, wicketsTaken: 12 },
      { id: 'p9', name: 'Anil Kumbley', jerseyNumber: 4, role: 'Bowler', runsScored: 15, wicketsTaken: 26 },
      { id: 'p10', name: 'Gautam Nambiar', jerseyNumber: 1, role: 'Wicketkeeper', runsScored: 215, wicketsTaken: 0 },
      { id: 'p11', name: 'Deepak Chahar', jerseyNumber: 9, role: 'Bowler', runsScored: 60, wicketsTaken: 15 }
    ]
  },
  {
    id: '3',
    name: 'Chennai Super Kings',
    captainName: 'MS Murthy',
    city: 'Chennai',
    players: [
      { id: 'p12', name: 'MS Murthy', jerseyNumber: 77, role: 'Wicketkeeper', runsScored: 480, wicketsTaken: 0 },
      { id: 'p13', name: 'Ravindra Naidu', jerseyNumber: 28, role: 'All-Rounder', runsScored: 320, wicketsTaken: 19 },
      { id: 'p14', name: 'Suresh Mani', jerseyNumber: 3, role: 'Batsman', runsScored: 395, wicketsTaken: 4 },
      { id: 'p15', name: 'Ashwin Kumar', jerseyNumber: 99, role: 'Bowler', runsScored: 120, wicketsTaken: 24 }
    ]
  },
  {
    id: '4',
    name: 'Mumbai Warriors',
    captainName: 'Rohit Deshmukh',
    city: 'Mumbai',
    players: [
      { id: 'p16', name: 'Rohit Deshmukh', jerseyNumber: 45, role: 'Batsman', runsScored: 460, wicketsTaken: 0 },
      { id: 'p17', name: 'Jasprit Patel', jerseyNumber: 93, role: 'Bowler', runsScored: 20, wicketsTaken: 31 },
      { id: 'p18', name: 'Hardik Kulkarni', jerseyNumber: 33, role: 'All-Rounder', runsScored: 380, wicketsTaken: 16 },
      { id: 'p19', name: 'Surya Jadhav', jerseyNumber: 63, role: 'Batsman', runsScored: 490, wicketsTaken: 0 }
    ]
  }
];

export const ACADEMY_INFO = {
  name: 'Match Day Elite Academy',
  tagline: 'Train like a pro. Play like a champion.',
  about: 'We focus on real match scenarios, fitness, and mental toughness to prepare young cricketers for league and tournament level with state-of-the-art turf pitches and high-speed bowling machines.',
  location: 'Hyderabad, Telangana (Near Gachibowli Stadium, Financial District)',
  highlights: [
    'Morning (6:00 AM - 9:00 AM) & Evening (4:00 PM - 7:30 PM) Batches',
    'BCCI Level 2 Certified Coaches & Ex-Ranji Trophy Mentors',
    'Weekend Practice & Tournament Matches with Live Ball-by-Ball Scoring',
    'Merlyn & Leverage High-Speed Bowling Machine Sessions',
    'High-Definition Pitch-Side Video Analysis & Biomechanics Reports'
  ],
  masterclass: {
    title: 'Batting Masterclass',
    description: 'Learn orthodox stroke play, power-hitting techniques, match scenario awareness, and game strategy with experienced coaches.',
    coach: 'Coach Rajeshwar Rao (Ex-First Class Player & BCCI Certified Coach)',
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-37872404797a?w=800'
  },
  centers: [
    {
      name: 'Main Elite Cricket Ground & Indoor Turf',
      address: 'Plot 42, Gachibowli Sports Hub, Near Stadium Gate 3, Hyderabad - 500032',
      timing: '6:00 AM - 9:30 PM'
    },
    {
      name: 'Madhapur High Performance Center',
      address: 'Kavuri Hills, Phase 2, Near Durgam Cheruvu, Hyderabad - 500081',
      timing: '5:30 AM - 8:30 PM'
    }
  ],
  contact: {
    phone: '+91 76809 22101',
    whatsapp: '+91 76809 22101',
    email: 'academy@crickheroes.local'
  }
};
