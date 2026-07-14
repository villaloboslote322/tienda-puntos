import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('=== TIENDA PUNTOS UI TEST ===\n');
    
    // 1. LOGIN
    console.log('1️⃣  LOGIN');
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const loggedIn = await page.textContent('text=Tienda Puntos - Admin');
    console.log('   Result:', loggedIn ? '✓ LOGIN OK' : '✗ Login failed');

    // 2. NAVIGATE TO ASIGNAR PUNTOS
    console.log('\n2️⃣  NAVIGATE TO ASIGNAR PUNTOS');
    await page.click('button:has-text("Asignar Puntos")');
    await page.waitForTimeout(500);
    const pageTitle = await page.textContent('text=Asignar Puntos');
    console.log('   Result:', pageTitle ? '✓ Page loaded' : '✗ Navigation failed');

    // 3. CHECK FORM FIELDS
    console.log('\n3️⃣  VERIFY FORM FIELDS');
    const dateInput = await page.$('input[type="date"]');
    const montoInput = await page.$('input[inputmode="decimal"]');
    const searchInput = await page.$('input[placeholder*="Buscar"]');
    
    console.log('   Date field (type="date"):', dateInput ? '✓' : '✗');
    console.log('   Monto field (inputmode="decimal"):', montoInput ? '✓' : '✗');
    console.log('   Search input:', searchInput ? '✓' : '✗');

    // 4. CHECK DATE DEFAULT
    if (dateInput) {
      const dateVal = await page.inputValue('input[type="date"]');
      console.log('   Date default:', dateVal);
    }

    // 5. SEARCH TEST
    console.log('\n4️⃣  SEARCH & SELECT');
    if (searchInput) {
      await page.fill('input[placeholder*="Buscar"]', 'Juan');
      await page.click('button:has-text("Buscar")');
      await page.waitForTimeout(800);
      const found = await page.textContent('text=Pérez');
      console.log('   Client found:', found ? '✓' : '✗');
      
      // 6. SELECT & ASSIGN
      const selectBtn = await page.$('button:has-text("Seleccionar")');
      if (selectBtn) {
        await page.click(selectBtn);
        await page.waitForTimeout(300);
        
        const clientSelected = await page.textContent('text=Cliente:');
        console.log('   Client selected:', clientSelected ? '✓' : '✗');
        
        // Assign points
        const montoField = await page.$('input[inputmode="decimal"]');
        if (montoField) {
          await page.fill('input[inputmode="decimal"]', '3500');
          await page.click('button:has-text("Asignar Puntos")');
          await page.waitForTimeout(1000);
          
          const success = await page.textContent('text=/Puntos actualizados/');
          console.log('   Points assigned:', success ? '✓' : '✗');
          if (success) {
            const msg = success.trim().substring(0, 60);
            console.log('   ', msg);
          }
        }
      }
    }

    console.log('\n✅ TEST COMPLETE');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();
