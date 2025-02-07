import {mount} from '@vue/test-utils';
import Home from '@/views/Home.vue';
import Leaderboard from '@/components/Leaderboard.vue';
import Account from '@/components/Account.vue';
import Credits from '@/components/Credits.vue';

describe('Home.vue', () => {
  let wrapper;
  let routerPushMock;

  beforeEach(() => {
    routerPushMock = jest.fn();
    const router = {push: routerPushMock};

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
    const headings = wrapper.findAll('h2').map(h2 => h2.text());
    expect(headings).toContain('Singleplayer');
    expect(headings).toContain('Multiplayer');
  });

  it('naviga a Game con la difficoltà selezionata quando si clicca su Inizia singleplayer', async () => {
    await wrapper.find('select.difficulty-select').setValue('medium');
    await wrapper.find('button.button').trigger('click'); // pulsante "Inizia" sotto Singleplayer

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'Game',
      query: {difficulty: 'medium'}
    });
  });

  // Nuovo test -> "Crea Lobby"
  it('naviga a Lobby quando si clicca su "Crea Lobby"', async () => {
    // Trova il pulsante "Crea Lobby" e cliccalo
    const createButton = wrapper.findAll('button.button').find(btn => btn.text() === 'Crea Lobby');
    await createButton.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith({name: 'Lobby'});
  });

  // Nuovo test -> "Entra in Lobby"
  it('naviga a Lobby quando si clicca su "Entra in Lobby"', async () => {
    // Trova il pulsante "Entra in Lobby" e cliccalo
    const joinButton = wrapper.findAll('button.button').find(btn => btn.text() === 'Entra in Lobby');
    await joinButton.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith({name: 'Lobby'});
  });

  it('mostra Leaderboard overlay quando si clicca su Mostra Classifica', async () => {
    const buttons = wrapper.findAll('button');
    const leaderboardButton = buttons.filter(btn => btn.text() === 'Mostra Classifica').at(0);

    if (!leaderboardButton) {
      throw new Error('Pulsante "Mostra Classifica" non trovato');
    }
    await leaderboardButton.trigger('click');

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
