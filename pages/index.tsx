import { ImageLinks } from "@/utils";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [doors, setDoors] = useState(3);
  const [winningDoor, setWinningDoor] = useState(500);
  const [doorWidth, setDoorWidth] = useState(400);
  const [doorHeight, setDoorHeight] = useState(500);

  const [pickedDoor, setPickedDoor] = useState<number>();

  const [lastDoor, setLastDoor] = useState<number>();

  const [isGameEnd, setIsGameEnd] = useState(false);

  const [gameMessage, setGameMessage] = useState("Select Any Door");

  const [simulatedResult, setSimulatedResult] = useState({
    wins: 0,
    loses: 0,
    winPercentage: "",
  });

  const [isSwitchCheckedForSimulation, setIsSwitchCheckedForSimulation] =
    useState(false);

  const [whenNotSwitchedResult, setWhenNotSwitchedResult] = useState({
    tries: 0,
    wins: 0,
  });

  const [whenSwitchedResult, setWhenSwitchedResult] = useState({
    tries: 0,
    wins: 0,
  });

  function montyHallSimulation(switchDoor: boolean, trials: number) {
    let wins = 0;
    let loses = 0;

    for (let i = 0; i < trials; i++) {
      // Randomly assign the winning door
      const winningDoor = Math.floor(Math.random() * 3);
      // Player's initial choice of door
      const playerChoice = Math.floor(Math.random() * 3);

      // Determine the door to reveal
      let revealedDoor;
      do {
        revealedDoor = Math.floor(Math.random() * 3);
      } while (revealedDoor === winningDoor || revealedDoor === playerChoice);

      // Switch to the remaining door if switchDoor is true
      const finalChoice = switchDoor
        ? [0, 1, 2].find(
            (door) => door !== playerChoice && door !== revealedDoor
          )
        : playerChoice;

      // Determine if the player wins
      if (finalChoice === winningDoor) {
        wins++;
      } else {
        loses++;
      }
    }

    const winPercentage = ((wins / trials) * 100).toFixed(2);

    setSimulatedResult({
      wins,
      loses,
      winPercentage: `${winPercentage}%`,
    });
  }

  useEffect(() => {
    setWinningDoor(Math.floor(Math.random() * doors));

    let height: number;
    let width: number;

    switch (doors) {
      case 10:
        height = 200;
        width = 100;
        break;
      case 50:
        height = 100;
        width = 90;
        break;
      case 100:
        height = 80;
        width = 70;
        break;
      default:
        height = 500;
        width = 400;
        break;
    }

    setDoorHeight(height);
    setDoorWidth(width);
  }, [doors]);

  useEffect(() => {
    if (pickedDoor !== undefined) {
      if (pickedDoor === winningDoor) {
        // If the picked door is the winning door, choose a random non-winning door
        let randomDoor;
        do {
          randomDoor = Math.floor(Math.random() * doors);
        } while (randomDoor === winningDoor);

        setLastDoor(randomDoor);
      } else {
        // If the picked door is not the winning door, set the winning door
        setLastDoor(winningDoor);
      }
    }
  }, [doors, pickedDoor, winningDoor]);

  const Button = ({
    label = "Click Me",
    onClick,
    disabled,
  }: {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
  }) => {
    return (
      <button
        onClick={onClick}
        style={{
          marginRight: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "16px",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
      >
        {label}
      </button>
    );
  };

  const RenderOpenDoor = (index: number) => {
    return (
      <div
        style={{
          position: "relative",
          width: `${doorWidth}px`,
          height: `${doorHeight}px`,
        }}
      >
        <Image
          src={index === winningDoor ? ImageLinks.car : ImageLinks.goat}
          alt={index === winningDoor ? "Car" : "Goat"}
          width={doorWidth / 2 - 10}
          height={doorHeight / 2 - 10}
          style={{
            position: "absolute",
            top: "25%",
            left: "25%",
            zIndex: 2,
            paddingLeft: 5,
          }}
        />
        <Image
          src={ImageLinks.openDoor}
          alt="Open Door"
          width={doorWidth}
          height={doorHeight}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      </div>
    );
  };

  const RenderDoor = (index: number) => {
    if (isGameEnd) {
      return RenderOpenDoor(index);
    }
    if (pickedDoor === undefined) {
      return (
        <Image
          src={ImageLinks.closedDoor}
          alt="closedDoor"
          width={doorWidth}
          height={doorHeight}
        />
      );
    }
    if (lastDoor !== undefined) {
      if (index === pickedDoor || index === lastDoor) {
        return (
          <Image
            src={ImageLinks.closedDoor}
            alt="closedDoor"
            width={doorWidth}
            height={doorHeight}
          />
        );
      } else {
        return RenderOpenDoor(index);
      }
    }
  };

  const GameClickLogic = (index: number) => {
    if (lastDoor !== undefined) {
      if (![lastDoor, pickedDoor].includes(index)) return;
      const playerWins = index === winningDoor;
      if (index === pickedDoor) {
        setGameMessage(
          playerWins
            ? "Oh this time you won by sticking to the same door"
            : "You should have chosen to switch"
        );
        setWhenNotSwitchedResult((prevValue) => {
          return {
            tries: prevValue.tries + 1,
            wins: playerWins ? prevValue.wins + 1 : prevValue.wins,
          };
        });
      } else {
        setGameMessage(
          playerWins
            ? "Nice move switching doors"
            : "2/3rd chances were you would have won and nice move but hard luck"
        );
        setWhenSwitchedResult((prevValue) => {
          return {
            tries: prevValue.tries + 1,
            wins: playerWins ? prevValue.wins + 1 : prevValue.wins,
          };
        });
      }
      setIsGameEnd(true);
    } else {
      setGameMessage(
        `You Have Selected Door: ${
          index + 1
        }, do you want to switch or stay with your door`
      );
    }
    setPickedDoor(index);
  };

  return (
    <>
      <Head>
        <title>Monty Hall Problem Simulator</title>
      </Head>
      <div>
        <h1 style={{ display: "flex", justifyContent: "center" }}>
          The Monty Hall Problem
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Button
              label="Show 3 doors"
              onClick={() => {
                setDoors(3);
              }}
            />
            <Button
              label="Show 100 doors"
              onClick={() => {
                setDoors(100);
              }}
            />
            <Button
              label="Reset Game"
              onClick={() => {
                setLastDoor(undefined);
                setPickedDoor(undefined);
                setIsGameEnd(false);
                setWinningDoor(Math.floor(Math.random() * doors));
                setGameMessage("Select Any Door");
              }}
              disabled={!isGameEnd}
            />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingRight: 10,
                  paddingBottom: 10,
                  paddingTop: 10,
                }}
              >
                <input
                  type="checkbox"
                  checked={isSwitchCheckedForSimulation}
                  onChange={() => {
                    setIsSwitchCheckedForSimulation(
                      !isSwitchCheckedForSimulation
                    );
                  }}
                  style={{
                    cursor: "pointer",
                    accentColor: "#4CAF50", // Green color
                  }}
                />
                <div
                  onClick={() => {
                    setIsSwitchCheckedForSimulation(
                      !isSwitchCheckedForSimulation
                    );
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "16px",
                    color: isSwitchCheckedForSimulation ? "#4CAF50" : "#000",
                  }}
                >
                  {isSwitchCheckedForSimulation ? "On" : "Off"}
                </div>
              </div>
              <Button
                label={`Simulate 1000 tries when the ${
                  isSwitchCheckedForSimulation
                    ? `user switches`
                    : `does not switch`
                }`}
                onClick={() =>
                  montyHallSimulation(isSwitchCheckedForSimulation, 1000)
                }
              />
            </div>
            <div>{JSON.stringify(simulatedResult)}</div>
          </div>
        </div>
        <div>When Switched: {JSON.stringify(whenSwitchedResult)}</div>
        <div style={{ paddingBottom: 10 }}>When Not Switched: {JSON.stringify(whenNotSwitchedResult)}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {Array.from({ length: doors }).map((_, index) => (
            <div
              key={index}
              onClick={
                isGameEnd
                  ? () => {}
                  : () => {
                      GameClickLogic(index);
                    }
              }
              style={{
                boxShadow:
                  pickedDoor === index ? "0 0 10px 5px yellow" : "none",
                cursor: "pointer",
              }}
            >
              {RenderDoor(index)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 10 }}>{gameMessage}</div>
        {isGameEnd && <div>The Game Has Ended</div>}
      </div>
    </>
  );
}
