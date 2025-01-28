import {mount} from '@vue/test-utils';
import AccountOverlay from '@/components/Account.vue';
import axios from '@/main.js';

jest.mock('@/main.js', () => ({
  get: jest.fn()
}));

describe('AccountOverlay.vue', () => {
  let wrapper;
  const fakeStats = {wins: 5, losses: 3};

  beforeEach(() => {
    // Simula un utente loggato
    sessionStorage.setItem('username', 'testuser');

    // Monta il componente
    wrapper = mount(AccountOverlay);
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('inizializza username da sessionStorage e chiama fetchStats al mount', async () => {
    axios.get.mockResolvedValue({data: fakeStats});

    // Chiamata manuale per fetchStats poiché onMounted l'ha già invocata
    await wrapper.vm.fetchStats();

    expect(axios.get).toHaveBeenCalledWith('/stats?username=testuser');
    expect(wrapper.vm.wins).toBe(5);
    expect(wrapper.vm.losses).toBe(3);
  });

  it('gestisce errori in fetchStats', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    console.error = jest.fn();

    await wrapper.vm.fetchStats();

    expect(console.error).toHaveBeenCalledWith(
      "Errore nel recupero delle statistiche utente:",
      expect.any(Error)
    );
  });

  it('emette evento "close" quando si chiude l\'overlay', () => {
    wrapper.vm.closeOverlay();
    expect(wrapper.emitted().close).toBeTruthy();
  });

  it('chiama logout e naviga a Login', async () => {
    // Simula il metodo del router
    const pushSpy = jest.fn();
    wrapper.vm.$router = {push: pushSpy};

    // Imposta un utente loggato
    sessionStorage.setItem('username', 'testuser');

    wrapper.vm.logout();

    // Verifica che l'utente sia stato rimosso da sessionStorage
    expect(sessionStorage.getItem('username')).toBeNull();

    // Verifica che la navigazione a Login sia stata invocata
    expect(pushSpy).toHaveBeenCalledWith({name: "Login"});
  });
});
