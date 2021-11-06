const should = require('chai').should();
const { BN, constants, expectEvent, expectRevert, time, singletons } = require('@openzeppelin/test-helpers');
const msgErrors = require('./helpers/msgErrors');

const AirdropMerkle = artifacts.require('AirdropMerkle');
const ERC20Token = artifacts.require('ERC20Token');

const ONE_ETHER = new BN('1000000000000000000');

contract('AirdropMerkle', ([owner, user, ...accounts]) => {

    let airdropMerkle, erc20Token;
    beforeEach('Deploy contracts', async () => {
        erc20Token = await ERC20Token.new({ from: owner });
        airdropMerkle = await AirdropMerkle.new({ from: owner });
    })
    describe('Deploy test', () => {
        it("Should deploy contract", async () => {
            const erc20Name = 'ERC20Token';
            (await erc20Token.name()).should.be.equal(erc20Name);
        })
    })
    describe('Set functions', () => {
    })
})