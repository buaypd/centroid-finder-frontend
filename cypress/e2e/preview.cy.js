// cypress/fixtures/frame.png is 60x40: black, with a pure-red 16x12 square
// at x 30..45, y 10..21. Integer-division centroid of the square = (37, 15).
// With a threshold above 255 every pixel matches, so the centroid is the
// middle of the whole image = (29, 19).

describe('Preview page (/preview/:filename)', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/videos', ['test.mp4']);
    cy.intercept('GET', '/thumbnail/test.mp4', {
      fixture: 'frame.png,null',
      headers: { 'content-type': 'image/png' },
    }).as('thumbnail');
    // The browser can't play a real video in these tests; the page copes.
    cy.intercept('GET', '/videos/test.mp4', { statusCode: 404 });
  });

  it('fetches the thumbnail and shows it next to the binarized image', () => {
    cy.visit('/preview/test.mp4');
    cy.wait('@thumbnail');

    cy.get('canvas[aria-label="First frame"]').should('be.visible');
    cy.get('canvas[aria-label="Binarized first frame"]').should('be.visible');
    cy.contains('figcaption', 'centroid 37, 15');
  });

  it('updates the binarized preview live when the threshold changes', () => {
    cy.visit('/preview/test.mp4');
    cy.contains('figcaption', 'centroid 37, 15');

    // Threshold 0 matches nothing (strict "<", like the Java code).
    cy.get('input[aria-label="Threshold value"]').type('{selectall}0');
    cy.contains('figcaption', 'no group found');

    // A large threshold matches the whole frame.
    cy.get('input[aria-label="Threshold value"]').type('{selectall}300');
    cy.contains('figcaption', 'centroid 29, 19');
  });

  it('updates the binarized preview live when the color changes', () => {
    cy.visit('/preview/test.mp4');
    cy.contains('figcaption', 'centroid 37, 15');

    // Targeting black selects the background (everything but the square).
    cy.get('input[aria-label="Target color hex"]').type('{selectall}000000{enter}');
    cy.contains('figcaption', /centroid \d+, \d+/).should('not.contain', '37, 15');
  });

  it('submits a job and tracks it until the CSV is ready', () => {
    let polls = 0;

    cy.intercept('POST', '/process/test.mp4*', { statusCode: 202, body: { jobId: 'job-123' } }).as('start');
    cy.intercept('GET', '/process/job-123/status', (req) => {
      polls += 1;
      req.reply(polls < 2 ? { status: 'processing' } : { status: 'done', result: '/results/test.mp4.csv' });
    }).as('status');
    cy.intercept('GET', '/results/test.mp4.csv', {
      body: '0,37,15\n0.033,-1,-1\n',
      headers: { 'content-type': 'text/csv' },
    });

    cy.visit('/preview/test.mp4');
    cy.contains('button', 'Process Video with These Settings').click();

    // POST /process/{filename}?targetColor=<hex>&threshold=<int>
    cy.wait('@start').its('request.url').should((url) => {
      const { pathname, searchParams } = new URL(url);
      expect(pathname).to.eq('/process/test.mp4');
      expect(searchParams.get('targetColor')).to.eq('ff0000');
      expect(searchParams.get('threshold')).to.eq('60');
    });

    // GET /process/{jobId}/status is polled until the job is done.
    cy.contains('.MuiChip-label', 'Processing');
    cy.contains('.MuiChip-label', 'Done', { timeout: 10000 });
    cy.get('@status.all').should('have.length.at.least', 2);

    cy.contains('a', 'Download CSV').should('have.attr', 'href', '/results/test.mp4.csv');
  });

  it('shows the error when the server rejects the job', () => {
    cy.intercept('POST', '/process/test.mp4*', { statusCode: 404, body: { error: 'video not found' } });

    cy.visit('/preview/test.mp4');
    cy.contains('button', 'Process Video with These Settings').click();

    cy.get('[role="alert"]').should('contain', 'video not found');
  });
});
