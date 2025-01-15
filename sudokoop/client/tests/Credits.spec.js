import { mount } from '@vue/test-utils';
import Credits from '@/components/Credits.vue';

describe('Credits.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Credits);
  });

  it('mostra correttamente il titolo e il pulsante', () => {
    // Controlla che il componente contenga il titolo "Crediti"
    expect(wrapper.text()).toContain('Crediti');

    // Verifica che esista un pulsante con la classe "white-button" e il testo "Chiudi"
    const button = wrapper.find('button.white-button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Chiudi');
  });

  it('emette l\'evento "close" quando si clicca sul pulsante di chiusura', async () => {
    const button = wrapper.find('button.white-button');
    await button.trigger('click');

    // Verifica che l'evento "close" sia stato emesso
    expect(wrapper.emitted()).toHaveProperty('close');
    expect(wrapper.emitted('close').length).toBe(1);
  });
});
