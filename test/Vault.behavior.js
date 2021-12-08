const {
  BN
} = require("@openzeppelin/test-helpers");

const {
  shouldReturnPaidOut,
  shouldReturnTotalPaidOut,
  shouldReturnIssuer,
  shouldCashChequeBeneficiary,
  shouldNotCashChequeBeneficiary,
  shouldWithdraw,
  shouldNotWithdraw,
  shouldDeposit,
} = require('./Vault.should.js')

// switch to false if you don't want to test the particular function
enabledTests = {
  cheques: true,
  issuer: true,
  cashChequeBeneficiary: true,
  withdraw: true,
  deposit: true
}

// constants to make the test-log more readable
const describeFunction = 'FUNCTION: '
const describePreCondition = 'PRE-CONDITION: '
const describeTest = 'TEST: '

// @param balance total ether deposited in vault
// @param issuer the issuer of the vault
// @param alice a counterparty of the vault 
// @param bob a counterparty of the vault
function shouldBehaveLikeVault([issuer, alice, bob, carol]) {
  // defaults used throught the tests
  const defaults = {
    beneficiary: bob,
    recipient: carol,
    firstCumulativePayout: new BN(500),
    secondCumulativePayout: new BN(1000),
    deposit: new BN(10000),
  }

  context('as a vault', function () {
    describe(describeFunction + 'paidOutCheques', function () {
      if (enabledTests.cheques) {
        const beneficiary = defaults.beneficiary
        context('when no cheque was ever cashed', function () {
          describe(describeTest + 'shouldReturnPaidOut', function () {
            const expectedAmount = new BN(0)
            shouldReturnPaidOut(beneficiary, expectedAmount)
            shouldReturnTotalPaidOut(expectedAmount)
          })
        })
        context('when a cheque was cashed', function () {
          describe(describePreCondition + 'shouldDeposit', function () {
            shouldDeposit(defaults.deposit, issuer)
            describe(describePreCondition + 'shouldCashChequeBeneficiary', function () {
              shouldCashChequeBeneficiary(defaults.recipient, defaults.firstCumulativePayout, issuer, defaults.beneficiary)
              describe(describeTest + 'shouldReturnPaidOut', function () {
                const expectedAmount = defaults.firstCumulativePayout
                shouldReturnPaidOut(beneficiary, expectedAmount)
                shouldReturnTotalPaidOut(expectedAmount)
              })
            })
          })
        })
      }
    })

    describe(describeFunction + 'issuer', function () {
      if (enabledTests.issuer) {
        shouldReturnIssuer(issuer)
      }
    })

    describe(describeFunction + 'cashChequeBeneficiary', function () {
      if (enabledTests.cashChequeBeneficiary) {
        const beneficiary = defaults.beneficiary
        context("when we don't send value along", function () {
          const value = new BN(0)
          context('when the issuer is a signee', function () {
            const sender = beneficiary
            const signee = issuer
            context('when the signee signs the correct fields', function () {
              context('when the recipient is not the beneficiary', function () {
                const recipient = defaults.recipient
                context('when we have not cashed a cheque before', function () {
                  const requestPayout = defaults.firstCumulativePayout
                  context('when there is some balance', function () {
                    context('when the balance is bigger than the requestPayout', function () {
                      describe(describePreCondition + 'shouldDeposit', function () {
                        const depositAmount = requestPayout.add(new BN(50))
                        shouldDeposit(depositAmount, issuer)
                        describe(describeTest + 'shouldCashChequeBeneficiary', function () {
                          shouldCashChequeBeneficiary(recipient, requestPayout, signee, sender)
                        })
                      })
                    })
                    context('when the balance equals the requestPayout', function () {
                      describe(describePreCondition + 'shouldDeposit', function () {
                        const depositAmount = requestPayout
                        shouldDeposit(depositAmount, issuer)
                        describe(describeTest + 'shouldCashChequeBeneficiary', function () {
                          shouldCashChequeBeneficiary(recipient, requestPayout, signee, sender)
                        })
                      })
                    })
                  })
                  context('when there is no balance', function () {
                    describe(describeTest + 'shouldCashChequeBeneficiary', function () {
                      shouldCashChequeBeneficiary(recipient, requestPayout, signee, sender)
                    })
                  })
                })

                context('when we have cashed a cheque before', function () {
                  describe(describePreCondition + 'shouldDeposit', function () {
                    shouldDeposit(defaults.deposit, issuer)
                    describe(describePreCondition + 'shouldCashChequeBeneficiary', function () {
                      shouldCashChequeBeneficiary(recipient, defaults.firstCumulativePayout, signee, sender)
                      describe(describeTest + 'shouldCashChequeBeneficiary', function () {
                        const revertMessage = "Vault: cannot cash"
                        shouldNotCashChequeBeneficiary(recipient, defaults.firstCumulativePayout, defaults.firstCumulativePayout, signee, sender, value, revertMessage)
                      })
                    })
                  })
                })
              })
              context('when the recipient is the beneficiary', function () {
                const recipient = defaults.beneficiary
                const requestPayout = defaults.firstCumulativePayout
                describe(describeTest + 'shouldCashChequeBeneficiary', function () {
                  shouldCashChequeBeneficiary(recipient, requestPayout, signee, sender)
                })
              })
            })
            context('when the signee does not sign the correct fields', function () {
              const revertMessage = "invalid issuer signature"
              const recipient = defaults.recipient
              const toSubmitCumulativePayment = defaults.firstCumulativePayout
              const toSignCumulativePayment = new BN(1)
              const sender = beneficiary
              shouldNotCashChequeBeneficiary(recipient, toSubmitCumulativePayment, toSignCumulativePayment, signee, sender, value, revertMessage)
            })
          })
          context('when the issuer is not a signee', function () {
            const revertMessage = "invalid issuer signature"
            const signee = alice
            const recipient = defaults.recipient
            const toSubmitCumulativePayment = defaults.firstCumulativePayout
            const toSignCumulativePayment = toSubmitCumulativePayment
            const sender = beneficiary
            shouldNotCashChequeBeneficiary(recipient, toSubmitCumulativePayment, toSignCumulativePayment, signee, sender, value, revertMessage)
          })
        })
        context('when we send value along', function () {
          const value = new BN(1)
          const revertMessage = "revert"
          const signee = alice
          const recipient = defaults.recipient
          const toSubmitCumulativePayment = defaults.firstCumulativePayout
          const toSignCumulativePayment = toSubmitCumulativePayment
          const sender = beneficiary
          describe(describeTest + 'shouldNotCashChequeBeneficiary', function () {
            shouldNotCashChequeBeneficiary(recipient, toSubmitCumulativePayment, toSignCumulativePayment, signee, sender, value, revertMessage)
          })
        })
        context('when the sender is not the issuer', function() {
          const value = new BN(0)
          const revertMessage = "invalid issuer signature"
          const signee = beneficiary
          const recipient = defaults.recipient
          const toSubmitCumulativePayment = defaults.firstCumulativePayout
          const toSignCumulativePayment = toSubmitCumulativePayment
          const sender = alice
          describe(describeTest + 'shouldNotCashChequeBeneficiary', function () {
            shouldNotCashChequeBeneficiary(recipient, toSubmitCumulativePayment, toSignCumulativePayment, signee, sender, value, revertMessage)
          })
        })
      }
    })

    describe(describeFunction + 'withdraw', function () {
      if (enabledTests.withdraw) {
        const withdrawAmount = new BN(50)
        context("when we don't send value along", function () {
          const value = new BN(0)
          context('when the sender is the issuer', function () {
            const sender = issuer
            context('when the totalbalance is more than the withdrawAmount', function () {
              const depositAmount = withdrawAmount.mul(new BN(2))
              describe(describePreCondition + 'shouldDeposit', function () {
                shouldDeposit(depositAmount, issuer)
                describe(describeTest + 'shouldWithdraw', function () {
                  shouldWithdraw(withdrawAmount, sender)
                })
              })
            })
            context('when the totalbalance equals the withdrawAount', function () {
              const depositAmount = withdrawAmount
              describe(describePreCondition + 'shouldDeposit', function () {
                shouldDeposit(depositAmount, issuer)
                describe(describeTest + 'shouldWithdraw', function () {
                  shouldWithdraw(withdrawAmount, sender)
                })
              })
            })
            context('when the totalbalance is less than the withdrawAmount', function () {
              const revertMessage = "totalbalance not sufficient"
              shouldNotWithdraw(withdrawAmount, sender, value, revertMessage)
            })
          })
          context('when the sender is not the issuer', function () {
            const sender = alice
            const revertMessage = "not issuer"
            shouldNotWithdraw(withdrawAmount, sender, value, revertMessage)
          })
        })
        context('when we send value along', function () {
          const value = new BN(1)
          const sender = alice
          const revertMessage = "revert"
          shouldNotWithdraw(withdrawAmount, sender, value, revertMessage)
        })
      }
    })

    describe(describeFunction + 'deposit', function () {
      if (enabledTests.deposit) {
        context('when the depositAmount is not zero', function () {
          const depositAmount = new BN(1)
          describe(describeTest + 'shouldDeposit', function () {
            shouldDeposit(depositAmount, issuer)
          })
        })
      }
    })
  })
}

module.exports = {
  shouldBehaveLikeVault
};