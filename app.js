class Note {
  constructor(id, title, text) {
    this.id = id;
    this.title = title;
    this.text = text;
  }
}

class App {
  constructor() {
    // State Hydration
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.selectedNoteId = "";

    // DOM Selection Targets 
    this.$inactiveForm = document.querySelector(".inactive-composer");
    this.$activeForm = document.querySelector(".active-composer");
    this.$noteTitle = document.querySelector("#note-title");
    this.$noteText = document.querySelector("#note-text");
    this.$notesGrid = document.querySelector(".notes-display-grid");
    this.$form = document.querySelector("#form");
    
    // Modal Targets (Native `<dialog>` Architecture)
    this.$modal = document.querySelector("#note-details-modal");
    this.$modalForm = document.querySelector("#modal-form");
    this.$modalTitle = document.querySelector("#modal-title");
    this.$modalText = document.querySelector("#modal-text");
    this.$closeModalBtn = document.querySelector("#modal-btn");

    // Initialize Routine
    this.init();
  }

  init() {
    this.addEventListeners();
    this.displayNotes();
  }

  addEventListeners() {
    // Global delegation context
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      this.handleNoteCardActions(event);
    });

    // Handle standard submission interceptors
    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.submitActiveForm();
    });

    this.$modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    // Close Modal event for Native `<dialog>` elements
    this.$closeModalBtn.addEventListener("click", () => this.closeModal());
  }

  handleFormClick(event) {
    const isInactiveFormClicked = this.$inactiveForm.contains(event.target);
    const isActiveFormClicked = this.$activeForm.contains(event.target);

    if (isInactiveFormClicked) {
      this.openActiveForm();
    } else if (!isActiveFormClicked && this.$activeForm.style.display === "block") {
      this.submitActiveForm();
    }
  }

  openActiveForm() {
    this.$inactiveForm.style.display = "none";
    this.$activeForm.style.display = "block";
    this.$noteText.focus();
  }

  closeActiveForm() {
    this.$inactiveForm.style.display = "block";
    this.$activeForm.style.display = "none";
    this.$noteTitle.value = "";
    this.$noteText.value = "";
  }

  submitActiveForm() {
    const title = this.$noteTitle.value.trim();
    const text = this.$noteText.value.trim();

    // Prevent creation of ghost/empty items
    if (title || text) {
      this.addNote({ title, text });
    }
    this.closeActiveForm();
  }

  handleNoteCardActions(event) {
    const $selectedNote = event.target.closest(".note");
    if (!$selectedNote) return;

    const isArchiveBtn = event.target.closest('[aria-label="Archive note"]');

    if (isArchiveBtn) {
      // Catch click actions targeting the local context archive controls
      this.deleteNote($selectedNote.id);
    } else if (!event.target.closest(".note-footer")) {
      // If clicking body background of the element block, activate edit viewport
      this.openModal($selectedNote);
    }
  }

  openModal($selectedNote) {
    this.selectedNoteId = $selectedNote.id;
    // Map text contexts cleanly to target structural components
    this.$modalTitle.value = $selectedNote.querySelector(".title").textContent;
    this.$modalText.value = $selectedNote.querySelector(".text").textContent;
    
    // Open via native standard modal orchestration spec
    this.$modal.showModal();
  }

  closeModal() {
    if (this.selectedNoteId) {
      this.editNote(this.selectedNoteId, {
        title: this.$modalTitle.value.trim(),
        text: this.$modalText.value.trim(),
      });
    }
    this.$modal.close();
    this.selectedNoteId = "";
  }

  addNote({ title, text }) {
    // Secure instantiation structure using browser UUID equivalents/CUID libraries
    const newNote = new Note(cuid(), title, text);
    this.notes = [...this.notes, newNote];
    this.render();
  }

  editNote(id, { title, text }) {
    // If an edited note is stripped of all text contents, safely drop it from space
    if (!title && !text) {
      this.deleteNote(id);
      return;
    }

    this.notes = this.notes.map((note) => {
      if (note.id === id) {
        note.title = title;
        note.text = text;
      }
      return note;
    });
    this.render();
  }

  deleteNote(id) {
    this.notes = this.notes.filter((note) => note.id !== id);
    this.render();
  }

  saveNotes() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  render() {
    this.saveNotes();
    this.displayNotes();
  }

  displayNotes() {
    // Safe validation if notes array is empty template fallback context
    if (this.notes.length === 0) {
      this.$notesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #5f6368; margin-top: 40px;">Notes you add appear here</p>`;
      return;
    }

    this.$notesGrid.innerHTML = this.notes
      .map(
        (note) => `
        <div class="note" id="${note.id}">
          <div class="note-content-body">
            <div class="title">${this.escapeHTML(note.title)}</div>
            <div class="text">${this.escapeHTML(note.text)}</div>
          </div>
          <div class="note-footer">
            <button type="button" class="icon-btn small tooltip-wrapper" aria-label="Remind me"><span class="material-symbols-outlined">add_alert</span><span class="tooltip-text">Remind me</span></button>
            <button type="button" class="icon-btn small tooltip-wrapper" aria-label="Add collaborator"><span class="material-symbols-outlined">person_add</span><span class="tooltip-text">Collaborator</span></button>
            <button type="button" class="icon-btn small tooltip-wrapper" aria-label="Change color"><span class="material-symbols-outlined">palette</span><span class="tooltip-text">Change Color</span></button>
            <button type="button" class="icon-btn small tooltip-wrapper" aria-label="Add image"><span class="material-symbols-outlined">image</span><span class="tooltip-text">Add Image</span></button>
            <button type="button" class="icon-btn small tooltip-wrapper" aria-label="Archive note"><span class="material-symbols-outlined">archive</span><span class="tooltip-text">Archive</span></button>
            <button type="button" class="icon-btn small tooltip-wrapper" aria-label="More options"><span class="material-symbols-outlined">more_vert</span><span class="tooltip-text">More</span></button>
          </div>
        </div>
      `
      )
      .join("");
  }

  // Cross-Site Scripting (XSS) Mitigation Protection Helper Method
  escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Instantiate App runtime Engine instance
const app = new App();
