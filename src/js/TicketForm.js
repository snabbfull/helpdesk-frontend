/**
 *  Класс для создания формы создания нового тикета
 * */
export default class TicketForm {
  constructor(container, ticketService, ticketView) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }
    this.container = container;
    this.ticketService = ticketService;
    this.ticketView = ticketView;
    this.getCreateForm = this.getCreateForm.bind(this);
    this.createFormButtonEvent = this.createFormButtonEvent.bind(this);
    this.container.addEventListener('click', this.createFormButtonEvent);
    this.createTicketBtnEvent = this.createTicketBtnEvent.bind(this);
    this.container.addEventListener('click', this.createTicketBtnEvent);
    this.deleteNewForm = this.deleteNewForm.bind(this);
    this.container.addEventListener('click', this.deleteNewForm);
  }

  getCreateForm() {
    const formOverlay = document.createElement('div');
    formOverlay.classList.add('createForm-overlay');

    formOverlay.innerHTML = `
    <div class="createForm">
      <h3>Create New Ticket</h3>
      <input type="text" id="ticketName" placeholder="Ticket Name" />
      <textarea id="ticketDescription" placeholder="Ticket Description"></textarea>
      <div class="createForm-actions">
        <button id="createTicketButton">Create Ticket</button>
        <button id="deleteNewForm">Cancel</button>
      </div>
    </div>
  `;

    return formOverlay;
  }

  data() {
    const name = this.container.querySelector('#ticketName').value;
    const description = this.container.querySelector('#ticketDescription').value;
    return { name, description };
  }

  createFormButton() {
    const button = document.createElement('div');
    button.innerHTML = `<button id="showCreateFormButton">New Ticket</button>`;
    this.container.append(button);
  }

  createFormButtonEvent(event) {
    if (event.target && event.target.id === 'showCreateFormButton') {
      const form = this.getCreateForm();
      this.container.append(form);
    }
  }

  createTicketBtnEvent(event) {
    if (event.target && event.target.id === 'createTicketButton') {
      const ticketData = this.data();
      this.ticketService.create(ticketData, this.ticketView.renderTicket.bind(this.ticketView));

      // Удаляем весь overlay, чтобы исчезло затемнение
      const overlay = this.container.querySelector('.createForm-overlay');
      if (overlay) overlay.remove();
    }
  }

  deleteNewForm(event) {
    if (event.target && event.target.id === 'deleteNewForm') {
      const overlay = this.container.querySelector('.createForm-overlay');
      if (overlay) overlay.remove();
    }
  }
}
