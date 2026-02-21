/**
 * Add Google Analytics to All HTML Files
 * 
 * Usage: node scripts/add-analytics.js G-XXXXXXXXXX
 */

const fs = require('fs');
const path = require('path');

// Get the GA ID from command line argument
const gaId = process.argv[2];

if (!gaId || !gaId.startsWith('G-')) {
  console.error('❌ Please provide a valid Google Analytics Measurement ID');
  console.error('Usage: node scripts/add-analytics.js G-XXXXXXXXXX');
  process.exit(1);
}

// Google Analytics snippet
const analyticsSnippet = `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>`;

// Find all HTML files in frontend directory
const frontendDir = path.join(__dirname, '../frontend');
const htmlFiles = [];

function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      htmlFiles.push(filePath);
    }
  });
}

findHtmlFiles(frontendDir);

console.log(`\n📊 Adding Google Analytics to ${htmlFiles.length} HTML files...\n`);

let updatedCount = 0;
let alreadyHasCount = 0;

htmlFiles.forEach(filePath => {
  const relativePath = path.relative(frontendDir, filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if analytics already exists
  if (content.includes('googletagmanager.com/gtag/js') || content.includes('google-analytics.com/ga.js')) {
    console.log(`⏭️  ${relativePath} - Already has analytics`);
    alreadyHasCount++;
    return;
  }
  
  // Find the closing </head> tag and insert analytics before it
  if (content.includes('</head>')) {
    content = content.replace('</head>', `${analyticsSnippet}\n</head>`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${relativePath} - Added analytics`);
    updatedCount++;
  } else {
    console.log(`⚠️  ${relativePath} - No </head> tag found, skipped`);
  }
});

console.log(`\n═══════════════════════════════════════`);
console.log(`📊 Analytics Setup Complete!`);
console.log(`═══════════════════════════════════════`);
console.log(`✅ Updated: ${updatedCount} files`);
console.log(`⏭️  Already had analytics: ${alreadyHasCount} files`);
console.log(`📁 Total HTML files: ${htmlFiles.length}`);
console.log(`\n🎯 Next steps:`);
console.log(`   1. Review the changes: git diff`);
console.log(`   2. Commit: git add . && git commit -m "Add Google Analytics"`);
console.log(`   3. Push: git push origin main`);
console.log(`   4. Wait ~2 minutes for deployment`);
console.log(`   5. Test in Google Analytics Realtime report\n`);
