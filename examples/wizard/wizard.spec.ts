import { Quaire } from '../../src';
import { questions } from './data';

describe('wizard', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions });
  });

  test('should show the progress', () => {
    expect(Q.getProgress()).toEqual({ answered: 0, total: 3 });

    Q.saveAnswer('m');
    Q.saveAnswer(true);

    // the total grows when the gift message is added to the path
    expect(Q.getProgress()).toEqual({ answered: 2, total: 4 });
  });

  test('should go back and forward', () => {
    Q.saveAnswer('m');
    Q.saveAnswer(false);
    expect(Q.getActiveQuestion().id).toBe(4);

    Q.back();
    expect(Q.getActiveQuestion().id).toBe(2);

    Q.saveAnswer(true);
    expect(Q.getActiveQuestion().id).toBe(3);

    Q.back();
    Q.back();
    expect(Q.getActiveQuestion().id).toBe(1);
    expect(Q.canGoBack()).toBe(false);
  });

  test('should complete the wizard', () => {
    Q.saveAnswer('l');
    Q.saveAnswer(true);
    Q.saveAnswer('Happy birthday!');
    expect(Q.isComplete()).toBe(false);

    Q.saveAnswer('Main Street 1');
    expect(Q.isComplete()).toBe(true);
    expect(Q.getResult()).toEqual({ size: 'l', gift: true, message: 'Happy birthday!', address: 'Main Street 1' });
  });

  test('should start again', () => {
    Q.saveAnswer('l');
    Q.reset();

    expect(Q.getActiveQuestion().id).toBe(1);
    expect(Q.getResult()).toEqual({});
  });

  test('should notify the view about every change', () => {
    const states: Array<number> = [];
    const unsubscribe = Q.subscribe((state) => states.push(state.progress.answered));

    Q.saveAnswer('s');
    Q.saveAnswer(false);
    Q.back();
    unsubscribe();
    Q.back();

    expect(states).toEqual([1, 2, 2]);
  });
});
