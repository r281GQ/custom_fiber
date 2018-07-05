const LONG_WORK = 100000000;

export default work => {
  const root = document.getElementById('root');

  const backGroundButton = document.createElement('button');
  backGroundButton.innerText = 'Change background color!';

  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'buttonContainer';

  const asyncButton = document.createElement('button');
  asyncButton.innerText = 'Async calculation';

  const syncButton = document.createElement('button');
  syncButton.innerText = 'Sync calculation!';

  buttonContainer.appendChild(asyncButton);

  buttonContainer.appendChild(syncButton);

  root.appendChild(backGroundButton);
  root.appendChild(buttonContainer);

  backGroundButton.style.backgroundColor = 'blue';
  backGroundButton.style.color = 'white';

  backGroundButton.addEventListener('click', () => {
    backGroundButton.style.backgroundColor =
      backGroundButton.style.backgroundColor === 'purple' ? 'blue' : 'purple';
  });

  asyncButton.addEventListener('click', () => {
    asyncButton.innerText = 'Calculation started!';
    requestIdleCallback(work(LONG_WORK));
  });

  syncButton.addEventListener('click', () => {
    syncButton.innerText = 'Calculation started!';
    work(LONG_WORK, false)();
  });
};
