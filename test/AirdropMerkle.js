const should = require('chai').should();
const { BN, constants, expectEvent, expectRevert, time, singletons } = require('@openzeppelin/test-helpers');
const msgErrors = require('./helpers/msgErrors');

const AirdropMerkle = artifacts.require('AirdropMerkle');
const ERC20Token = artifacts.require('ERC20Token');

const ONE_ETHER = new BN('1000000000000000000');

contract('AirdropMerkle', ([owner, user, ...accounts]) => {

    let airdropMerkle, erc20Token;
    beforeEach('Deploy contracts', async () => {
        const merkleRoot = `0x${'0'.repeat(64)}`;
        erc20Token = await ERC20Token.new({ from: owner });
        airdropMerkle = await AirdropMerkle.new(merkleRoot, erc20Token.address, { from: owner });
    })
    describe('Deploy test', () => {
        it("Should deploy contract", async () => {
            const erc20Name = 'ERC20Token';
            (await erc20Token.name()).should.be.equal(erc20Name);
        })
    })
    describe('Set functions', () => {
        it(("Should allow change token address with owner"), async () => {
            await airdropMerkle.setTokenContract(accounts[0], { from: owner });
            (await airdropMerkle.tokenContract()).should.be.equal(accounts[0]);
        })
        it(("Should deny change token address with user"), async () => {
            await expectRevert(
                airdropMerkle.setTokenContract(accounts[0], { from: user }),
                msgErrors.owner
            );
        })
        it(("Should allow change merkle root with owner"), async () => {
            const merkleRoot = `0x${'1'.repeat(64)}`;
            await airdropMerkle.setMerkleRoot(merkleRoot, { from: owner });
            (await airdropMerkle.merkleRoot()).should.be.equal(merkleRoot);
        })
        it(("Should deny change merke root with user"), async () => {
            const merkleRoot = `0x${'1'.repeat(64)}`;
            await expectRevert(
                airdropMerkle.setMerkleRoot(merkleRoot, { from: user }),
                msgErrors.owner
            );
        })
    })
})