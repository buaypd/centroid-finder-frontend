describe('Video Chooser (/videos)', () => {
  beforeEach(() => {
    // Thumbnails on the cards.
    cy.intercept('GET', '/thumbnail/*', { fixture: 'frame.png,null', headers: { 'content-type': 'image/png' } });
  });

  it('redirects / to /videos', () => {
    cy.intercept('GET', '/api/videos', ['a.mp4']);
    cy.visit('/');
    cy.location('pathname').should('eq', '/videos');
  });

  it('lists the videos returned by GET /api/videos', () => {
    cy.intercept('GET', '/api/videos', ['salamander1.mp4', 'forest_intro.mp4']).as('videos');
    cy.visit('/videos');
    cy.wait('@videos');

    cy.contains('2 videos');
    cy.contains('salamander1.mp4');
    cy.contains('forest_intro.mp4');
  });

  it('opens /preview/:filename when a video is clicked', () => {
    cy.intercept('GET', '/api/videos', ['salamander1.mp4']);
    cy.intercept('GET', '/videos/*', { statusCode: 404 });
    cy.visit('/videos');

    cy.contains('salamander1.mp4').click();
    cy.location('pathname').should('eq', '/preview/salamander1.mp4');
  });

  it('shows an error when the API fails', () => {
    cy.intercept('GET', '/api/videos', { statusCode: 500, body: { error: 'Error reading video directory' } });
    cy.visit('/videos');

    cy.get('[role="alert"]').should('contain', 'Error reading video directory');
  });

  it('shows a message when there are no videos', () => {
    cy.intercept('GET', '/api/videos', []);
    cy.visit('/videos');

    cy.contains('No videos yet');
  });
});
