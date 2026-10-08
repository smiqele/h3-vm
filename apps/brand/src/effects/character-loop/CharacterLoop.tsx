export function CharacterLoop({ terminal = false }: { terminal?: boolean }) {
  return (
    <div className="character-loop" data-terminal={terminal || undefined} data-node-id="2094:8378">
      <div className="character-loop__scale">
        <div className="character-loop__sprite">
          <div
            className="character-loop__hand character-loop__hand--left"
            data-node-id="2094:8418"
          />
          <div className="character-loop__body" data-node-id="2094:8410">
            <span className="character-loop__eye character-loop__eye--left" data-node-id="2094:8414" />
            <span className="character-loop__eye character-loop__eye--right" data-node-id="2094:8415" />
          </div>
          <div
            className="character-loop__hand character-loop__hand--right"
            data-node-id="2094:8428"
          />
        </div>
      </div>
    </div>
  );
}
