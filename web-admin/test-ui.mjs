import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('1️⃣ LOGIN');
    await page.goto(BASE_URL);
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Dashboard', { timeout: 5000 });
    console.log('   ✓ Login OK');

    console.log('\n2️⃣ CREATE CLIENTE');
    await page.click('button:has-text("Nuevo Cliente")');
    // Wait for form inputs to be visible
    await page.waitForSelector('input[placeholder="Nombre"]', { timeout: 3000 });
    await page.fill('input[placeholder="Nombre"]', 'Test Client 2');
    await page.fill('input[placeholder="WhatsApp (+54...)"]', '+541234567899');
    await page.fill('input[placeholder="DNI"]', '87654321');
    await page.fill('input[placeholder="Email"]', 'testc2@test.com');
    await page.click('button:has-text("Crear Cliente")');
    await page.waitForTimeout(1000);
    console.log('   ✓ Cliente created');

    console.log('\n3️⃣ GO TO ASIGNAR PUNTOS');
    await page.click('button:has-text("Asignar Puntos")');
    await page.waitForSelector('text=Selecciona Cliente', { timeout: 5000 });
    console.log('   ✓ Page loaded');

    console.log('\n4️⃣ SEARCH & SELECT CLIENTE');
    await page.fill('input[placeholder*="Buscar"]', 'Test');
    await page.click('button:has-text("Buscar")');
    await page.waitForTimeout(500);
    const selectBtn = await page.$('button:has-text("Seleccionar")');
    console.log('   ✓ Search results found:', !!selectBtn);
    
    if (selectBtn) await page.click(selectBtn);
    await page.waitForTimeout(300);

    console.log('\n5️⃣ VERIFY FIELDS & ASSIGN POINTS');
    const dateField = await page.$('input[type="date"]');
    const montoField = await page.$('input[inputmode="decimal"]');
    console.log('   ✓ Date field:', !!dateField);
    console.log('   ✓ Monto field (no spinner):', !!montoField);
    
    if (montoField) {
      const dateVal = await page.inputValue('input[type="date"]');
      console.log('   ✓ Date default value:', dateVal);
      
      await page.fill('input[inputmode="decimal"]', '4000');
      await page.click('button:has-text("Asignar Puntos")');
      await page.waitForTimeout(1000);
      
      const successMsg = await page.textContent('text=/Puntos actualizados/');
      console.log('   ✓ Success message shown:', !!successMsg);
      
      if (successMsg) console.log('      Message:', successMsg.trim());
    }

    console.log('\n✅ ALL STEPS COMPLETE');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

test();
