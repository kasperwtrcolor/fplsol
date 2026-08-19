const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(/activeGame\.entryFee = 0\.05;/g, 'activeGame.entryFee = 100000;');
content = content.replace(/entryFee: 0\.05/g, 'entryFee: 100000');
content = content.replace(/currentEntriesCount \* 0\.05/g, 'currentEntriesCount * 100000');
content = content.replace(/entries\.length \* 0\.05/g, 'entries.length * 100000');
content = content.replace(/entriesCount \* 0\.05/g, 'entriesCount * 100000');
content = content.replace(/0\.05 \$FPLS/g, '100,000 $test');
content = content.replace(/0\.01/g, '100000');

fs.writeFileSync('src/App.jsx', content);
