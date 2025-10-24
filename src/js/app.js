import HelpDesk from './HelpDesk';
import TicketService from './TicketService';
import TicketView from './TicketView';
import TicketForm from './TicketForm';

const root = document.getElementById('root');

const ticketService = new TicketService();
const app = new HelpDesk(root, ticketService);

const ticketView = new TicketView(root, ticketService);
const ticketForm = new TicketForm(root, ticketService, ticketView);

ticketForm.createFormButton();
ticketService.list(ticketView.renderList.bind(ticketView));
app.init();
