import {mount} from '@vue/test-utils';
import SinglePlayer from '@/views/SinglePlayer.vue';

describe('SinglePlayer.vue', () => {
  let routerPushMock;

  // Funzione di factory per montare il componente con un router mock
  const factory = () => {
    routerPushMock = jest.fn();
    return mount(SinglePlayer, {
      global: {
        mocks: {
          $router: {
            push: routerPushMock
          }
        }
      }
    });
  };

  it('imposta difficoltà iniziale a "easy"', () => {
    const wrapper = factory();
    expect(wrapper.vm.selectedDifficulty).toBe('easy');
  });

  it('aggiorna selectedDifficulty quando selezionata un\'altra opzione', async () => {
    const wrapper = factory();
    const select = wrapper.find('select');
    await select.setValue('hard');
    expect(wrapper.vm.selectedDifficulty).toBe('hard');
  });

  it('naviga alla rotta "Game" con la difficoltà selezionata quando si clicca il bottone', async () => {
    const wrapper = factory();
    // Impostazione manuale della difficoltà
    await wrapper.setData({selectedDifficulty: 'medium'});

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith({name: 'Game', query: {difficulty: 'medium'}});
  });
});
