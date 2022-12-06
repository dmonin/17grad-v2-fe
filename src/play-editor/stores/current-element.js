import { writable } from 'svelte/store';


function currentElementStore() {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,
    select: (playElement) => {
      update(currentPlayElement => {
        if (currentPlayElement) {
          currentPlayElement.element.classList.remove('editor-selected');
        }

        playElement.element.classList.add('editor-selected');

        return playElement;
      });
    },
    set,
    update
	};
}

export const currentElement = currentElementStore();