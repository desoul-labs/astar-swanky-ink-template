import { expect, getSigners } from '../helpers';
import { ApiPromise } from '@polkadot/api';
import ConstructorsPSP34 from './typedContract/constructors/psp34';
import ContractPSP34 from './typedContract/contracts/psp34';
import * as PSP34Returns from './typedContract/types-returns/psp34';
import * as PSP34Args from './typedContract/types-arguments/psp34';
import { addressToU8a } from '@polkadot/util-crypto/address/util';
import { type KeyringPair } from '@polkadot/keyring/types';
import type * as QueryMethods from './typedContract/query/psp34';
import type * as TxMethods from './typedContract/tx-sign-and-send/psp34';

interface Setup {
  api: ApiPromise;
  defaultSigner: KeyringPair;
  alice: KeyringPair;
  bob: KeyringPair;
  contract: ContractPSP34;
  query: QueryMethods.default;
  tx: TxMethods.default;
  close: () => Promise<void>;
}

describe('psp34', () => {
  async function setup(): Promise<Setup> {
    const api = await ApiPromise.create();

    const signers = getSigners();
    const defaultSigner = signers[2];
    const alice = signers[0];
    const bob = signers[1];

    const contractFactory = new ConstructorsPSP34(api, defaultSigner);
    const contractAddress = (await contractFactory.new()).address;
    const contract = new ContractPSP34(contractAddress, defaultSigner, api);

    return {
      api,
      defaultSigner,
      alice,
      bob,
      contract,
      query: contract.query,
      tx: contract.tx,
      close: async () => {
        await api.disconnect();
      },
    };
  }

  it('Return collection_id of account', async () => {
    const { query, contract, close } = await setup();

    const expectedCollectionId = PSP34Returns.IdBuilder.Bytes(
      addressToU8a(contract.address) as unknown as number[],
    );
    const actualCollectionId = await query.collectionId();
    void expect(actualCollectionId).to.have.output(expectedCollectionId.bytes);

    await close();
  });

  it('Returns total supply', async () => {
    const { query, tx, close } = await setup();

    await expect(query.totalSupply()).to.have.bnToNumber(0);
    await tx.mintToken();
    await tx.mintToken();
    await tx.mintToken();

    await expect(query.totalSupply()).to.have.bnToNumber(3);

    await close();
  });

  it('Transfer works', async () => {
    const { contract, defaultSigner: sender, alice, query, tx, close } = await setup();

    await tx.mintToken();

    await expect(query.balanceOf(sender.address)).to.have.output(1);
    await expect(query.balanceOf(alice.address)).to.have.output(0);

    await contract.tx.transfer(alice.address, PSP34Args.IdBuilder.U8(0), []);

    await expect(query.balanceOf(sender.address)).to.have.output(0);
    await expect(query.balanceOf(alice.address)).to.have.output(1);

    await close();
  });

  it('Approved transfer works', async () => {
    const { contract, defaultSigner: sender, query, tx, alice, close } = await setup();

    await tx.mintToken();

    await expect(query.balanceOf(sender.address)).to.have.output(1);
    await expect(query.balanceOf(alice.address)).to.have.output(0);

    const tokenId = PSP34Args.IdBuilder.U8(0);

    // Approve only transfer for token 1
    await contract.tx.approve(alice.address, tokenId, true);

    await contract.withSigner(alice).tx.transfer(alice.address, tokenId, []);

    await expect(query.balanceOf(sender.address)).to.have.output(0);
    await expect(query.balanceOf(alice.address)).to.have.output(1);

    await close();
  });

  it('Approved operator transfer works', async () => {
    const { contract, defaultSigner: sender, alice, query, tx, close } = await setup();

    await tx.mintToken();

    await expect(query.balanceOf(sender.address)).to.have.output(1);
    await expect(query.balanceOf(alice.address)).to.have.output(0);
    // Approved transfer for any token
    await contract.tx.approve(alice.address, null, true);

    await contract.withSigner(alice).tx.transfer(alice.address, PSP34Args.IdBuilder.U8(0), []);

    await expect(query.balanceOf(sender.address)).to.have.output(0);
    await expect(query.balanceOf(alice.address)).to.have.output(1);

    await close();
  });

  it('Can not transfer non-existing token', async () => {
    const { contract, alice: receiver, defaultSigner: sender, query, close } = await setup();

    await expect(query.balanceOf(sender.address)).to.have.output(0);

    await expect(contract.tx.transfer(receiver.address, PSP34Args.IdBuilder.U8(0), [])).to
      .eventually.be.rejected;

    await expect(query.balanceOf(sender.address)).to.have.output(0);

    await close();
  });

  it('Can not transfer without allowance', async () => {
    const { contract, alice, defaultSigner: sender, query, tx, close } = await setup();

    await tx.mintToken();
    await expect(query.balanceOf(sender.address)).to.have.output(1);

    await expect(
      contract.withSigner(alice).tx.transfer(alice.address, PSP34Args.IdBuilder.U8(0), []),
    ).to.eventually.be.rejected;

    await expect(query.balanceOf(sender.address)).to.have.output(1);

    await close();
  });

  it('Can mint any Id', async () => {
    const { defaultSigner: sender, query, tx, close } = await setup();

    const ids = [
      PSP34Args.IdBuilder.U8(123),
      PSP34Args.IdBuilder.U16(123),
      PSP34Args.IdBuilder.U32(123),
      PSP34Args.IdBuilder.U64(123),
      PSP34Args.IdBuilder.U128(123),
      PSP34Args.IdBuilder.Bytes(['1', '2', '3']),
    ];

    let index = 0;
    for (const id of ids) {
      await expect(query.balanceOf(sender.address)).to.have.output(index);
      await expect(query.ownerOf(id)).to.have.output(null);
      await tx.mint(id);
      await expect(query.ownerOf(id)).to.have.output(sender.address);
      index++;
    }

    await expect(query.balanceOf(sender.address)).to.have.output(6);

    await close();
  });
});
