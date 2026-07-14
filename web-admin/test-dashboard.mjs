import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🧪 DASHBOARD TEST\n');
    
    // LOGIN
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    console.log('1️⃣  Login: ✓');

    // CHECK STATS
    const totalText = await page.textContent('text=Total Clientes');
    console.log('2️⃣  Stats visible:', totalText ? '✓' : '✗');
    
    const clientCount = await page.textContent('text=/\d+/');
    console.log('   Total:', clientCount?.trim().substring(0, 20));

    // CHECK CLIENT LIST
    const listTitle = await page.textContent('text=Listado de Clientes');
    console.log('3️⃣  Client list:', listTitle ? '✓' : '✗');

    // EXPAND CLIENT
    const expandBtn = await page.$('button:has-text("Juan")');
    if (expandBtn) {
      console.log('4️⃣  Client found: ✓');
      await page.click(expandBtn);
      await page.waitForTimeout(300);
      
      const dniField = await page.textContent('text=DNI');
      const puntosField = await page.textContent('text=Puntos Actuales');
      console.log('   Details shown:', dniField && puntosField ? '✓' : '✗');
      
      const points = await page.textContent('text=/\d+ pts/');
      if (points) console.log('   Points:', points.trim().substring(0, 15));
    }

    console.log('\n✅ DASHBOARD OK');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();
