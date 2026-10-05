import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Restful Booker', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  let token: string;
  let bookingId: number;

  const booking = {
    firstname: 'Ana',
    lastname: 'Vicenzi',
    totalprice: 350,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-11-01',
      checkout: '2026-11-05'
    },
    additionalneeds: 'Breakfast'
  };

  p.request.setDefaultTimeout(30000);
  p.request.setDefaultHeaders({ Accept: 'application/json' });

  beforeAll(async () => {
    p.reporter.add(rep);

    token = await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withJson({ username: 'admin', password: 'password123' })
      .expectStatus(StatusCodes.OK)
      .returns('token');
  });

  afterAll(() => p.reporter.end());

  describe('Booking', () => {
    it('POST criar uma nova reserva', async () => {
      bookingId = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withJson(booking)
        .expectStatus(StatusCodes.OK)
        .expectJson('booking.firstname', 'Ana')
        .expectJson('booking.totalprice', 350)
        .returns('bookingid');
    });

    it('GET consultar a reserva criada', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${bookingId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('firstname', 'Ana')
        .expectJson('lastname', 'Vicenzi');
    });

    it('PUT atualizar a reserva', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Cookie', `token=${token}`)
        .withJson({ ...booking, firstname: 'Ana Laura', totalprice: 500 })
        .expectStatus(StatusCodes.OK)
        .expectJson('firstname', 'Ana Laura')
        .expectJson('totalprice', 500);
    });

    it('DELETE remover a reserva', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Cookie', `token=${token}`)
        .expectStatus(StatusCodes.CREATED);
    });

    it('GET reserva removida retorna 404', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${bookingId}`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});