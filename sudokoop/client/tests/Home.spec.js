import {mount} from '@vue/test-utils';
import Home from '@/views/Home.vue';
import Leaderboard from '@/components/Leaderboard.vue';
import Account from '@/components/Account.vue';
import Credits from '@/components/Credits.vue';

describe('Home.vue', () => {
  let wrapper;
  let routerPushMock;

  beforeEach(() => {
    // Crea un mock per $router con push
    routerPushMock = jest.fn();
    const router = {push: routerPushMock};

    // Monta il componente Home con i componenti stub per Leaderboard, Account e Credits
    wrapper = mount(Home, {
      global: {
        mocks: {
          $router: router
        },
        stubs: {
          Leaderboard: true,
          Account: true,
          Credits: true,
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('renderizza correttamente i pulsanti e gli elementi principali', () => {
    expect(wrapper.find('h1.title').text()).toBe('Sudokoop');

    // Trova tutti gli elementi h2 e verifica che contengano i testi desiderati
    const headings = wrapper.findAll('h2').map(h2 => h2.text());
    expect(headings).toContain('Singleplayer');
    expect(headings).toContain('Multiplayer');
  });

  it('naviga a Game con la difficoltà selezionata quando si clicca su Inizia singleplayer', async () => {
    // Simula la selezione di una difficoltà
    await wrapper.find('select.difficulty-select').setValue('medium');
    await wrapper.find('button.button').trigger('click'); // pulsante Inizia Singleplayer

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'Game',
      query: {difficulty: 'medium'}
    });
  });

  it('naviga a Lobby quando si clicca su Crea/Entra in Lobby', async () => {
    // Trova il pulsante Multiplayer e cliccalo
    const multiplayerButton = wrapper.findAll('button.button').find(btn => btn.text() === 'Crea/Entra in Lobby');
    await multiplayerButton.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith({name: 'Lobby'});
  });

  it('mostra Leaderboard overlay quando si clicca su Mostra Classifica', async () => {
    // Trova tutti i pulsanti e poi filtra quello con il testo "Mostra Classifica"
    const buttons = wrapper.findAll('button');
    const leaderboardButton = buttons.filter(btn => btn.text() === 'Mostra Classifica').at(0);

    // Se non viene trovato, lancia un errore significativo
    if (!leaderboardButton) {
      throw new Error('Pulsante "Mostra Classifica" non trovato');
    }

    await leaderboardButton.trigger('click');

    // Controlla che la proprietà leaderboardVisible sia true e che Leaderboard sia renderizzato
    expect(wrapper.vm.leaderboardVisible).toBe(true);
    expect(wrapper.findComponent(Leaderboard).exists()).toBe(true);
  });

  it('mostra Account overlay quando si clicca su Account', async () => {
    const accountButton = wrapper.findAll('button').find(btn => btn.text() === 'Account');
    await accountButton.trigger('click');

    expect(wrapper.vm.accountVisible).toBe(true);
    expect(wrapper.findComponent(Account).exists()).toBe(true);
  });

  it('mostra Credits overlay quando si clicca su Crediti', async () => {
    const creditsButton = wrapper.findAll('button').find(btn => btn.text() === 'Crediti');
    await creditsButton.trigger('click');

    expect(wrapper.vm.creditsVisible).toBe(true);
    expect(wrapper.findComponent(Credits).exists()).toBe(true);
  });
});
