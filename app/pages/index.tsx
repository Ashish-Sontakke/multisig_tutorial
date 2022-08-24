import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3 from "web3";
import { useEffect, useState } from "react";
import MultisigContract from "../../build/contracts/MultisigWallet.json";

// contract address: 0x52F72d6FAdfBbd78b03069441f408Ec0B63c48B5
const Home: NextPage = () => {
  // connected to this wallet
  const [address, setAddress] = useState<string>("");
  const [multisigContract, setContract] = useState<any>();
  const [contractBalance, setContractBalance] = useState<any>();

  const [newOwnerAddress, setNewOwnerAddress] = useState<string>("");

  const [newProposalInfo, setInfo] = useState<string>();
  const [newProposalAmount, setAmount] = useState<number>();
  const [newProposalTo, setTO] = useState<string>();

  async function connectWallet() {
    // connecting to wallet
    const web3 = new Web3((window as any).ethereum);

    //
    const chainId = await web3.eth.net.getId();
    const addresses = await web3.eth.requestAccounts();
    console.log(addresses);

    const contract = new web3.eth.Contract(
      MultisigContract.abi as any,
      "0xA57397fE1359399a03041ed30063001255Ce559e"
    );

    console.log(contract);
    setContract(contract);
    setAddress(addresses[0]);
  }

  async function getAuthority() {
    console.log("my contract", multisigContract);
    const authority = await multisigContract.methods.authority().call();
    console.log("the authority is", authority);
  }

  async function addOwner() {
    const isValid = Web3.utils.isAddress(newOwnerAddress);
    if (isValid) {
      const transaction = await multisigContract.methods
        .addNewOwner(newOwnerAddress)
        .send({ from: address });
      console.log(transaction);

      const owners = await multisigContract.methods.noOfOwners().call();

      console.log("no of owners", owners);
    } else {
      console.log("address is invalid");
    }
  }

  async function createProposal() {
    const tx = await multisigContract.methods
      .submitProposal(
        newProposalTo,
        Web3.utils.toWei(newProposalAmount!.toString()),
        newProposalInfo
      )
      .send({ from: address });
    console.log(tx);
  }

  async function approve() {
    // we will be hardcoding proposal id as 0; it will be first proposal
    const tx = await multisigContract.methods.accept(0).send({ from: address });
    console.log(tx);
  }

  async function execute() {
    // we will be hardcoding proposal id as 0; it will be first proposal
    const tx = await multisigContract.methods
      .execute(0)
      .send({ from: address });
    console.log(tx);
  }

  async function getContractEtherBalance() {
    const web3 = new Web3((window as any).ethereum);

    let balance = await web3.eth.getBalance(
      "0xA57397fE1359399a03041ed30063001255Ce559e"
    );
    setContractBalance(Web3.utils.fromWei(balance.toString()));
  }

  useEffect(() => {
    getContractEtherBalance();
  });

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.card}>
          <h1>Details</h1>
          <p>Balance {contractBalance}</p>
          <p>Show details about the contract</p>
          <p>Proposals</p>
          <p>Owners</p>
          <p>{address}</p>
          <button
            className={styles.button}
            onClick={() => {
              connectWallet();
            }}
          >
            Connect Wallet
          </button>
          <button
            className={styles.button}
            onClick={() => {
              getAuthority();
            }}
          >
            Initialize
          </button>
        </div>

        <div className={styles.card}>
          <h1>Owners</h1>

          <p>Create Proposal</p>
          <label className={styles.label}>Proposal Details: </label>
          <input
            className={styles.input}
            type="text"
            onChange={(e) => {
              setInfo(e.target.value);
            }}
          />

          <label className={styles.label}>To address: </label>
          <input
            className={styles.input}
            type="text"
            onChange={(e) => {
              setTO(e.target.value);
            }}
          />

          <label className={styles.label}>Amount: </label>
          <input
            className={styles.input}
            type="number"
            onChange={(e) => {
              setAmount(parseInt(e.target.value));
            }}
          />
          <button
            className={styles.button}
            onClick={() => {
              createProposal();
            }}
          >
            Create
          </button>

          <p>Approve a Proposal</p>
          <label className={styles.label}>Proposal Id: </label>
          <input className={styles.input} type="number" />
          <button
            className={styles.button}
            onClick={() => {
              approve();
            }}
          >
            Approve
          </button>

          <p>Execute a Proposal</p>

          <label className={styles.label}>Proposal Id: </label>
          <input className={styles.input} type="number" />
          <button
            className={styles.button}
            onClick={() => {
              execute();
            }}
          >
            Execute
          </button>
        </div>
        <div className={styles.card}>
          <h1>Authority</h1>
          <p>Add new Owner</p>

          <label className={styles.label}>Owner wallet address: </label>
          <input
            className={styles.input}
            onChange={(e) => {
              setNewOwnerAddress(e.target.value);
            }}
          />
          <button
            className={styles.button}
            onClick={() => {
              addOwner();
            }}
          >
            Add
          </button>

          <p>Remove Owner</p>
          <label className={styles.label}>owner wallet address: </label>
          <input className={styles.input} />
          <button className={styles.button}>Remove</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
