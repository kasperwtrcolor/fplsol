const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add showRosterModal state
content = content.replace(
  /const \[theme, setTheme\] = useState\('light'\);/,
  "const [theme, setTheme] = useState('light');\n  const [showRosterModal, setShowRosterModal] = useState(false);"
);

// 2. Change Header Text & Subtitle
content = content.replace(
  /<span>Just a \$FPLS<\/span>/,
  '<div className="flex flex-col"><span>Fantasy Premier League Stock</span><span className="text-xs text-gray-500 font-sans tracking-widest uppercase">Powered by $FPLS</span></div>'
);

// 3. Fix LimelightNav
content = content.replace(
  /className={`transition-colors whitespace-nowrap pb-1 border-b-2 \$\{isActive \? 'text-white border-green-500' : 'hover:text-gray-300 border-transparent'\}`\}/g,
  "className={`transition-colors whitespace-nowrap pb-1 border-b-2 font-bold ${isActive ? 'text-black dark:text-white border-black dark:border-white' : 'text-gray-500 hover:text-black dark:hover:text-white border-transparent'}`}"
);

// 4. Fix Landing Page Text
content = content.replace(
  /<h1 className="text-6xl md:text-\[110px\] leading-\[0\.85\] font-black text-white uppercase tracking-tighter text-center mb-8 font-sans">/g,
  '<h1 className="text-6xl md:text-[110px] leading-[0.85] font-black text-black dark:text-white tracking-tighter text-center mb-8 font-hand">'
);
content = content.replace(
  /<p className="text-\[var\(--emerald-glow\)\] font-mono text-\[10px\] md:text-xs uppercase tracking-\[0\.25em\] text-center max-w-lg leading-relaxed mb-12">/g,
  '<p className="text-gray-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-center max-w-lg leading-relaxed mb-12">'
);
content = content.replace(
  /<button \s*onClick=\{\(\) => setCurrentView\('team'\)\}\s*className="border border-white hover:border-\[var\(--emerald-glow\)\] text-white hover:text-\[var\(--emerald-glow\)\] px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-colors mb-6"/g,
  '<button onClick={() => setCurrentView(\'team\')} className="btn-brutal px-12 py-4 text-xl mb-6">'
);
content = content.replace(
  /<span className="text-\[var\(--emerald-glow\)\] font-mono text-\[10px\] uppercase tracking-widest">Gameweek \{activeGameweek\.gameweek\} Active<\/span>/g,
  '<span className="text-black dark:text-white font-mono font-bold text-[10px] uppercase tracking-widest">Gameweek {activeGameweek.gameweek} Active</span>'
);

// Replace bad How-it-works colors
content = content.replace(/text-\[var\(--emerald-glow\)\]/g, 'text-black dark:text-white font-bold');

// 5. Fix Formations
const formRegex = /className=\{\`relative px-3 py-1 md:px-4 md:py-1 border transition-colors duration-300 font-mono text-\[9px\] md:text-\[10px\] tracking-widest \$\{isActive \? .*? \}\`\}/g;
const formNewClass = 'className={`relative px-3 py-1 md:px-4 md:py-1 border-2 font-mono text-[9px] md:text-[10px] tracking-widest font-bold transition-all rounded ${isActive ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-brutal dark:shadow-brutal-dark translate-x-[-2px] translate-y-[-2px]" : "bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black dark:bg-zinc-800 dark:border-gray-600 dark:hover:border-white dark:hover:text-white"}`}';
content = content.replace(formRegex, formNewClass);

// 6. Fix Submit Button
content = content.replace(
  /<button onClick=\{submitTeam\} className="w-full border border-white text-black dark:text-white py-3 font-mono text-xs tracking-widest hover:bg-white hover:text-black transition-colors">SUBMIT TEAM \(100,000 \$test\)<\/button>/g,
  '<button onClick={submitTeam} className="btn-brutal w-full">SUBMIT TEAM (100,000 $FPLS)</button>'
);

// 7. Update Pitch Layout to 100% width
content = content.replace(
  /<div className="w-full xl:w-\[60%\] flex flex-col p-6 xl:p-10 overflow-y-auto items-center">/,
  '<div className="w-full flex flex-col p-6 xl:p-10 overflow-y-auto items-center">'
);
content = content.replace(
  /scale-\[0\.8\] sm:scale-90 xl:scale-100 origin-top mx-auto/g,
  'scale-[0.9] sm:scale-100 xl:scale-125 origin-top mx-auto'
);

// 8. Add BROWSE PLAYERS button
content = content.replace(
  /<div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">/,
  `<div className="mt-20 xl:mt-32 pt-4 border-t border-gray-300 dark:border-gray-700 w-full max-w-2xl text-center">
    {!isTeamSubmitted && (
      <button onClick={() => setShowRosterModal(true)} className="btn-brutal w-full mb-4 bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-600 dark:text-white">
        🔍 BROWSE PLAYERS
      </button>
    )}`
);

// 9. Wrap Right Column in Modal
// The right column starts with: <div className="w-full xl:w-[40%] flex flex-col h-[600px] xl:h-[80vh] card-brutal mt-8 xl:mt-0 xl:ml-6 overflow-hidden">
const newRightColumn = `
        {/* Roster Modal */}
        {showRosterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl flex flex-col h-[85vh] card-brutal overflow-hidden relative">
              <button 
                onClick={() => setShowRosterModal(false)}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-brutal w-8 h-8 rounded-full flex items-center justify-center font-bold text-black dark:text-white"
              >
                ✕
              </button>
              <div className="flex-1 flex flex-col pt-2 bg-white dark:bg-zinc-900">
`;

// Wrap the right column inside the modal (ONLY the roster version, not leaderboard!)
// So we find the isTeamSubmitted ? branch...
// Currently it is: `) : (<div className="w-full xl:w-[40%] flex flex-col h-[600px] xl:h-[80vh] card-brutal mt-8 xl:mt-0 xl:ml-6 overflow-hidden">`
content = content.replace(
  /\) : \(\s*<div className="w-full xl:w-\[40%\] flex flex-col h-\[600px\] xl:h-\[80vh\] card-brutal mt-8 xl:mt-0 xl:ml-6 overflow-hidden">/,
  ') : (\n  <>\n' + newRightColumn
);

// Close the modal and the Fragment where the roster ends
// We know it ends after the "No players found" div.
const rosterEnd = `{getFilteredPlayers().length === 0 && (
                <div className="text-center text-gray-500 font-mono py-8">No players found matching your criteria.</div>
              )}
            </div>`;
content = content.replace(
  rosterEnd,
  rosterEnd + '\n              </div>\n            </div>\n          </div>\n        )}\n  </>'
);

// 10. Clean up text-white where it's on white backgrounds in light mode.
// We'll target the How-It-Works sections specifically since they are hardcoded.
content = content.replace(
  /<h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">/g,
  '<h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-none font-hand">'
);
content = content.replace(
  /<p className="text-gray-400 font-mono text-xs leading-relaxed max-w-md">/g,
  '<p className="text-gray-600 dark:text-gray-400 font-mono text-xs leading-relaxed max-w-md">'
);

fs.writeFileSync('src/App.jsx', content);
