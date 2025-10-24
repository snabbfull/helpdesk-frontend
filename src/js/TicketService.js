/* eslint-disable no-shadow */
/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов
 * */
export default class TicketService {
  list(callback) {
    fetch('http://localhost:7070/?method=allTickets', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => console.error('Error:', error));
  }

  get(id, callback) {
    fetch(`http://localhost:7070/?method=ticketById&id=${id}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => console.error('Error:', error));
  }

  create(data, callback) {
    fetch('http://localhost:7070/?method=createTicket', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => console.error('Error:', error));
  }

  update(id, data, callback) {
    fetch(`http://localhost:7070/?method=updateById&id=${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      // eslint-disable-next-line no-shadow
      .then((data) => callback(data))
      .catch((error) => console.error('Error:', error));
  }

  delete(id, callback) {
    fetch(`http://localhost:7070/?method=deleteById&id=${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => callback(data))
      .catch((error) => console.error('Error:', error));
  }
}
