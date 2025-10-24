export default class TicketView {
  constructor(container, ticketService) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }

    this.container = container;
    this.ticketService = ticketService;

    // Привязки контекста
    this.deleteTicketEvent = this.deleteTicketEvent.bind(this);
    this.editTicketEvent = this.editTicketEvent.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.toggleStatusEvent = this.toggleStatusEvent.bind(this);
    this.handleConfirmEvent = this.handleConfirmEvent.bind(this);
    this.toggleDescription = this.toggleDescription.bind(this);

    // Подписки
    this.container.addEventListener('click', this.deleteTicketEvent);
    this.container.addEventListener('click', this.editTicketEvent);
    this.container.addEventListener('click', this.cancelEdit);
    this.container.addEventListener('click', this.updateForm);
    this.container.addEventListener('change', this.toggleStatusEvent);
    this.container.addEventListener('click', this.toggleDescription);

    // ❗ ВАЖНО: слушаем клики для модалки ТОЛЬКО НА document
    document.addEventListener('click', this.handleConfirmEvent);
  }

  renderList(tickets) {
    this.container.innerHTML = '';
    tickets.forEach((ticket) => {
      const item = this.createTicketElement(ticket);
      this.container.append(item);
    });

    // === возвращаем кнопку создания тикета ===
    if (!this.container.querySelector('#showCreateFormButton')) {
      const createBtn = document.createElement('button');
      createBtn.id = 'showCreateFormButton';
      createBtn.textContent = 'New Ticket';
      this.container.prepend(createBtn);
    }
  }

  createTicketElement(ticket) {
    const ticketElement = document.createElement('div');
    ticketElement.className = 'ticket';
    ticketElement.dataset.id = ticket.id;

    ticketElement.innerHTML = `
      <div class="ticket-main">
        <input type="checkbox" class="ticket-status" ${ticket.status ? 'checked' : ''} />
        <span class="ticket-title">${ticket.name}</span>
        <span class="status-indicator">${ticket.status ? 'Done' : ''}</span>
        <span class="ticket-date">${new Date(ticket.created).toLocaleString()}</span>
        <div class="ticket-actions">
          <span class="editTicket" data-id="${ticket.id}">✎</span>
          <span class="deleteTicket" data-id="${ticket.id}">✖</span>
        </div>
      </div>
      <div class="ticket-description hidden">${ticket.description || ''}</div>
    `;

    return ticketElement;
  }

  renderTicket(ticket) {
    const ticketElement = this.createTicketElement(ticket);
    this.container.append(ticketElement);
  }

  // ==== УДАЛЕНИЕ ====
  deleteTicketEvent(event) {
    if (event.target && event.target.classList.contains('deleteTicket')) {
      const ticketElement = event.target.closest('.ticket');
      const ticketId = ticketElement.dataset.id;
      this.showConfirmModal(ticketId);
    }
  }

  // Показываем окно подтверждения
  showConfirmModal(ticketId) {
    // Если модалка уже открыта — не дублируем
    if (this.container.querySelector('.confirm-overlay')) return;

    const overlay = document.createElement('div');
    overlay.classList.add('confirm-overlay');
    overlay.innerHTML = `
    <div class="confirm-modal">
      <p>Are you sure you want to delete this ticket?</p>
      <div class="confirm-actions">
        <button id="confirmOk" data-id="${ticketId}">OK</button>
        <button id="confirmCancel">Cancel</button>
      </div>
    </div>
  `;
    document.body.append(overlay); // важно: добавляем в body, а не в container
  }

  // Слушатель кликов по окну подтверждения
  async handleConfirmEvent(event) {
    const overlay = document.querySelector('.confirm-overlay');
    if (!overlay) return;

    // Cancel
    if (event.target.id === 'confirmCancel') {
      overlay.remove();
      return;
    }

    // OK
    if (event.target.id === 'confirmOk') {
      const ticketId = event.target.dataset.id;
      this.ticketService.delete(ticketId);
      overlay.remove();
      const ticketElement = this.container.querySelector(`.ticket[data-id="${ticketId}"]`);
      if (ticketElement) ticketElement.remove();
    }
  }

  // ==== РЕДАКТИРОВАНИЕ ====
  editTicket(ticketId) {
    const editForm = document.createElement('div');
    editForm.classList.add('editForm-overlay');
    editForm.dataset.id = ticketId;

    editForm.innerHTML = `
      <div class="editForm-modal editForm">
        <h3>Edit Ticket</h3>
        <input type="text" id="editTicketName" placeholder="Ticket Name" />
        <textarea id="editTicketDescription" placeholder="Ticket Description"></textarea>
        <div class="editForm-actions">
          <button id="saveTicketButton" data-id="${ticketId}">Save Changes</button>
          <button id="cancelEditButton">Cancel</button>
        </div>
      </div>
    `;

    return editForm;
  }

  editTicketEvent(event) {
    if (event.target && event.target.classList.contains('editTicket')) {
      const ticketId = event.target.dataset.id;
      const editForm = this.editTicket(ticketId);
      this.container.append(editForm);
    }
  }

  cancelEdit(event) {
    if (event.target && event.target.id === 'cancelEditButton') {
      const overlay = this.container.querySelector('.editForm-overlay');
      if (overlay) overlay.remove();
    }
  }

  updateForm(event) {
    if (event.target && event.target.id === 'saveTicketButton') {
      const ticketId = event.target.dataset.id;
      const name = this.container.querySelector('#editTicketName').value;
      const description = this.container.querySelector('#editTicketDescription').value;
      const updatedData = { name, description };

      this.ticketService.update(ticketId, updatedData, () => {
        const overlay = this.container.querySelector('.editForm-overlay');
        if (overlay) overlay.remove();
        this.ticketService.list((tickets) => this.renderList(tickets));
      });
    }
  }

  // ==== СТАТУС ====
  toggleStatusEvent(event) {
    if (event.target && event.target.classList.contains('ticket-status')) {
      const ticketElement = event.target.closest('.ticket');
      const ticketId = ticketElement.dataset.id;
      const status = event.target.checked;

      this.ticketService.update(ticketId, { status }, () => {
        const indicator = ticketElement.querySelector('.status-indicator');
        indicator.textContent = status ? 'Done' : '';
      });
    }
  }

  // ==== ОПИСАНИЕ ====
  toggleDescription(event) {
    const ticket = event.target.closest('.ticket');
    // eslint-disable-next-line prettier/prettier
    if (!ticket || event.target.classList.contains('deleteTicket') || event.target.classList.contains('editTicket') || event.target.classList.contains('ticket-status')) {
      return; // чтобы не мешало кнопкам
    }

    const description = ticket.querySelector('.ticket-description');
    if (description) {
      description.classList.toggle('hidden');
    }
  }
}
