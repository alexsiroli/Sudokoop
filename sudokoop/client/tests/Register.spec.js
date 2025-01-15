import { mount } from '@vue/test-utils';
import Register from '@/views/Register.vue';
import axios from '@/main.js';
import socket from '@/plugins/socket.js';
import { createRouter, createWebHistory } from 'vue-router';

// Mock di axios e socket.io
jest.mock('@/main.js', () => ({
  post: jest.fn()
}));
jest.mock('@/plugins/socket.js', () => ({
  emit: jest.fn()
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { name: 'Home', path: '/', component: { template: '<div>Home</div>' } }
  ]
});

describe('Register.vue', () => {
  let wrapper;

  beforeEach(() => {
    sessionStorage.clear();
    wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mostra countdown se già loggato', async () => {
    sessionStorage.setItem('username', 'testuser');
    wrapper = mount(Register, {
      global: { plugins: [router] }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Sei già loggato come testuser!');
  });

  it('cambia route se countdown termina', async () => {
    jest.useFakeTimers();
    sessionStorage.setItem('username', 'testuser');

    wrapper = mount(Register, {
      global: { plugins: [router] }
    });

    const pushSpy = jest.spyOn(router, 'push');

    jest.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();

    expect(pushSpy).toHaveBeenCalledWith({ name: "Home" });

    jest.useRealTimers();
  });

  it('invoca axios.post e reindirizza su successo', async () => {
    wrapper = mount(Register, {
      global: { plugins: [router] }
    });

    // Imposta i valori degli input
    await wrapper.find('input[type="text"]').setValue('newuser');
    await wrapper.find('input[type="password"]').setValue('password123');

    // Simula una registrazione avvenuta con successo
    axios.post.mockResolvedValueOnce({});

    const pushSpy = jest.spyOn(router, 'push');

    // Sottomette il form
    await wrapper.find('form').trigger('submit.prevent');

    // Verifica che axios.post sia stato chiamato con i dati corretti
    expect(axios.post).toHaveBeenCalledWith("/register", {
      userName: 'newuser',
      password: 'password123'
    });

    // Verifica l'emissione dello username tramite socket, l'aggiornamento di sessionStorage e il reindirizzamento
    expect(socket.emit).toHaveBeenCalledWith("username", 'newuser');
    expect(sessionStorage.getItem('username')).toBe('newuser');
    expect(pushSpy).toHaveBeenCalledWith({ name: "Home" });
  });

  it('gestisce errore di registrazione', async () => {
    wrapper = mount(Register, {
      global: { plugins: [router] }
    });

    await wrapper.find('input[type="text"]').setValue('newuser');
    await wrapper.find('input[type="password"]').setValue('password123');

    axios.post.mockRejectedValueOnce({ response: { data: { error: "Errore registrazione" } } });

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();  // Attende l'aggiornamento del DOM

    expect(wrapper.text()).toContain("Errore registrazione");
  });
});
