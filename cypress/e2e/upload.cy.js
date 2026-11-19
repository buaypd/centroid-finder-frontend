describe('Uploading a video', () => {
  const pick = (fileName, mimeType = 'video/mp4') =>
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('fake video bytes'), fileName, mimeType },
      { force: true },
    );

  beforeEach(() => {
    cy.intercept('GET', '/thumbnail/*', { fixture: 'frame.png,null', headers: { 'content-type': 'image/png' } });
  });

  function openDialog() {
    cy.contains('button', 'Upload').click();
    cy.get('[role="dialog"]').should('contain', 'Upload a video');
  }

  it('uploads the file, closes the dialog and shows the new video in the library', () => {
    let uploaded = false;
    cy.intercept('GET', '/api/videos', (req) => req.reply(uploaded ? ['old.mp4', 'fresh.mp4'] : ['old.mp4']));
    cy.intercept('POST', '/api/videos', (req) => {
      uploaded = true;
      req.reply({ statusCode: 201, body: { filename: 'fresh.mp4' } });
    }).as('upload');

    cy.visit('/videos');
    cy.contains('1 item');

    openDialog();
    cy.get('[role="dialog"]').contains('button', 'Upload').should('be.disabled'); // nothing chosen yet
    pick('fresh.mp4');
    cy.get('[role="dialog"]').should('contain', 'fresh.mp4');
    cy.get('[role="dialog"]').contains('button', 'Upload').click();

    // The request is multipart with the file in the "video" field.
    cy.wait('@upload').then(({ request }) => {
      expect(request.headers['content-type']).to.include('multipart/form-data');
      expect(String(request.body)).to.include('name="video"');
      expect(String(request.body)).to.include('filename="fresh.mp4"');
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('2 items');
    cy.contains('fresh');
  });

  it('rejects a file that is not a video before sending anything', () => {
    cy.intercept('GET', '/api/videos', ['old.mp4']);
    cy.intercept('POST', '/api/videos', cy.spy().as('upload'));

    cy.visit('/videos');
    openDialog();
    pick('notes.txt', 'text/plain');

    cy.get('[role="dialog"]').should('contain', 'Unsupported file type');
    cy.get('[role="dialog"]').contains('button', 'Upload').should('be.disabled');
    cy.get('@upload').should('not.have.been.called');
  });

  it("shows the server's message when the upload fails", () => {
    cy.intercept('GET', '/api/videos', ['old.mp4']);
    cy.intercept('POST', '/api/videos', {
      statusCode: 409,
      body: { error: 'A video named "old.mp4" already exists.' },
    });

    cy.visit('/videos');
    openDialog();
    pick('old.mp4');
    cy.get('[role="dialog"]').contains('button', 'Upload').click();

    cy.get('[role="dialog"] [role="alert"]').should('contain', 'already exists');
    cy.get('[role="dialog"]').should('exist'); // stays open so the user can pick another file
  });

  it('can be cancelled', () => {
    cy.intercept('GET', '/api/videos', ['old.mp4']);

    cy.visit('/videos');
    openDialog();
    cy.contains('button', 'Cancel').click();

    cy.get('[role="dialog"]').should('not.exist');
  });
});
