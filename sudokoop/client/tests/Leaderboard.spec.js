import { mount, flushPromises } from '@vue/test-utils';
import Leaderboard from '@/components/Leaderboard.vue';
import axios from '@/main.js';

jest.mock('@/main.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('Leaderboard.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Monta il componente Leaderboard prima di ogni test
    wrapper = mount(Leaderboard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('visualizza "Caricamento classifica..." quando loading è true', async () => {
    // Accede allo stato di setup e imposta loading a true
    wrapper.vm.$.setupState.loading = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Caricamento classifica...');
  });

  it('emette evento "close" quando il pulsante Chiudi è cliccato', async () => {
    const closeButton = wrapper.find('button.close-button');
    await closeButton.trigger('click');
    expect(wrapper.emitted().close).toBeTruthy();
  });

  it('formatta correttamente il tempo', () => {
    const formatted = wrapper.vm.formatTime(125000); // 125.000 ms = 02:05
    expect(formatted).toBe('02:05');
  });

  it('recupera i dati della classifica al mount', async () => {
    const fakeData = [
      { username: 'user1', milliseconds: 90000, difficulty: 'easy' }
    ];
    axios.get.mockResolvedValue({ data: fakeData });

    // Rimonta il componente per attivare onMounted con il nuovo mock
    wrapper = mount(Leaderboard);
    await flushPromises();

    expect(axios.get).toHaveBeenCalledWith("/game/leaderboard");
    expect(wrapper.vm.$.setupState.leaderboardData).toEqual(fakeData);
    expect(wrapper.vm.$.setupState.loading).toBe(false);
  });

  it('visualizza correttamente le righe della classifica quando il caricamento è terminato', async () => {
    const fakeData = [
      { username: 'user1', milliseconds: 90000, difficulty: 'easy' },
      { username: 'user2', milliseconds: 120000, difficulty: 'medium' }
    ];
    axios.get.mockResolvedValue({ data: fakeData });

    wrapper = mount(Leaderboard);
    await flushPromises();

    const rows = wrapper.findAll('tr.leaderboard-row');
    expect(rows.length).toBe(fakeData.length);

    fakeData.forEach((record, index) => {
      const cells = rows[index].findAll('td');
      // Verifica che l'indice e i dati siano visualizzati correttamente
      expect(cells[0].text()).toBe(String(index + 1));
      expect(cells[1].text()).toBe(record.username);
      const formattedTime = wrapper.vm.formatTime(record.milliseconds);
      expect(cells[2].text()).toBe(formattedTime);
      expect(cells[3].text()).toBe(record.difficulty);
    });
  });
});
