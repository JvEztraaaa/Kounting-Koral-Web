const fs = require('fs');
const path = require('path');

const basePath = process.cwd();

const directories = [
    'src/lib',
    'src/components/ui',
    'src/components/layout',
    'src/components/common',
    'src/features/auth',
    'src/features/shifts',
    'src/features/insights',
    'src/features/settings',
    'src/hooks',
    'src/pages',
    'supabase',
    'tests'
];

console.log('📁 Creating directories...\n');

directories.forEach(dir => {
    const fullPath = path.join(basePath, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log('  ✓ Created: ' + dir);
    } else {
        console.log('  ✓ Exists: ' + dir);
    }
});

console.log('\n✅ Done!');
