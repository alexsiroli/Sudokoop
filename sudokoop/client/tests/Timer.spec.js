import { mount } from '@vue/test-utils';
import Timer from '@/components/Timer.vue';

jest.useFakeTimers();

describe('Timer.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Timer);
  });

  afterEach(() => {
    jest.clearAllTimers();
    wrapper.unmount();
  });

  it('computed property formattedTime restituisce tempo formattato correttamente', async () => {
    // Imposta manualmente timeSpent per testare il formato
    await wrapper.setData({ timeSpent: 125000 }); // 125000 ms = 2 minuti e 5 secondi
    expect(wrapper.vm.formattedTime).toBe('02:05');
  });

  it('startTimer imposta timerInterval e aggiorna timeSpent correttamente', async () => {
    const originalDateNow = Date.now;
    let now = 1000000;
    Date.now = jest.fn(() => now);

    // Avvia il timer
    wrapper.vm.startTimer();

    // Verifica che il timer sia stato inizializzato
    expect(wrapper.vm.timeSpent).toBe(0);
    expect(wrapper.vm.startTime).toBe(now);
    expect(wrapper.vm.timerInterval).not.toBeNull();

    // Avanza il timer fittizio di 500ms
    now += 500;
    jest.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    // Controlla che timeSpent sia aggiornato (≥ 500ms)
    expect(wrapper.vm.timeSpent).toBeGreaterThanOrEqual(500);

    // Ferma il timer e ripristina Date.now
    wrapper.vm.stopTimer();
    Date.now = originalDateNow;
  });

  it('stopTimer cancella correttamente il timerInterval', () => {
    // Imposta un timerInterval fittizio
    wrapper.vm.timerInterval = setInterval(() => {}, 1000);
    expect(wrapper.vm.timerInterval).not.toBeNull();

    // Arresta il timer
    wrapper.vm.stopTimer();

    // Verifica che il timerInterval sia stato cancellato
    expect(wrapper.vm.timerInterval).toBeNull();
  });

  it('stopTimer non lancia errori se timerInterval è già nullo', () => {
    wrapper.vm.timerInterval = null;
    expect(() => wrapper.vm.stopTimer()).not.toThrow();
  });
});
