describe('Chat E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display chat screen on app launch', async () => {
    await expect(element(by.id('chat-screen'))).toBeVisible();
  });

  it('should navigate between tabs', async () => {
    await element(by.text('Updates')).tap();
    await expect(element(by.text('Updates'))).toBeVisible();

    await element(by.text('Chat')).tap();
    await expect(element(by.text('Chat'))).toBeVisible();

    await element(by.text('Settings')).tap();
    await expect(element(by.text('Settings'))).toBeVisible();
  });

  it('should send a text message', async () => {
    await element(by.id('message-input')).typeText('Hello, this is a test message');
    await element(by.id('send-button')).tap();
    await expect(element(by.text('Hello, this is a test message'))).toBeVisible();
  });

  it('should display typing indicator', async () => {
    await element(by.id('message-input')).typeText('Test');
    await element(by.id('send-button')).tap();
    await expect(element(by.id('typing-indicator'))).toBeVisible();
  });

  it('should open attachment modal', async () => {
    await element(by.id('attach-button')).tap();
    await expect(element(by.text('Take Camera'))).toBeVisible();
    await expect(element(by.text('Choose from Gallery'))).toBeVisible();
  });
});

