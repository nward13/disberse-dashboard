export default async (
  web3,                 // web3 instance
  account,              // account we want transactions for
  toAccount=false,      // get transactions to or from this account?
  reverseOrder=false,   // most recent transactions first?
  startBlock=null,      // block to start searching for txs
  endBlock=null,        // block to finish searching for txs
  numItems=200,         // max number of transactions to return
) => {
    // default to searching entire blockchain history
    if (!endBlock) {
      endBlock = await web3.eth.getBlockNumber();
    }
    if (!startBlock) {
      startBlock = 0;
    }

    // console.log("web3.eth.getCode(account): ", await web3.eth.getCode(account));
  
    // decide if we're looking for txs from account or to account
    const accountParam = toAccount ? 'to' : 'from';
    
    // number of txs to look for. if start block is not zero, look for
    // the number of txs acct sent at end block - number sent at start block
    const txCount = startBlock === 0 
      ? await web3.eth.getTransactionCount(account, endBlock)
      : await web3.eth.getTransactionCount(account, endBlock) -
        await web3.eth.getTransactionCount(account, startBlock);

    // number of txs to look for, including the possibility that caller
    // might only want a certain number of them
    let numTxs;
    if (!toAccount) {
      numTxs = Math.min(numItems, txCount);
    } else {
      // can't get incoming tx count from web3, so we just have to search everything
      numTxs = numItems;
    }
  
    // no web3 api for getting all transactions from or to an address, so
    // we just search the blockchain block by block
    let txs = [];
    if (!reverseOrder) {
      // go through each block and grab each transaction that is either
      // to acct or from acct (depending what caller is looking for)
      for (let i = endBlock; i >= startBlock && txs.length < numTxs; i--) {
        let block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
          block.transactions.forEach(tx => {
            // Make sure we're not grabbing extra txs if they're in the same block
            if (tx[accountParam] === account && txs.length < numTxs) {
              txs.push(tx);
            }
          });
        }
      }
    } else {
      // same as above, but in reverse order
      for (let i = startBlock; i <= endBlock && txs.length < numTxs; i++) {
        let block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
          block.transactions.forEach(tx => {
            // Make sure we're not grabbing extra txs if they're in the same block
            if (tx[accountParam] === account && txs.length < numTxs) {
              txs.push(tx);
            }
          });
        }      
      }
    }

    

    // if we sent the transaction, we want more info on it (i.e. is it a contract tx)
    if (!toAccount) {
      txs.forEach(tx => {
        tx.toContract = web3.eth.getCode(tx.to) === '0x0' ? true : false;
        
        // - If address has code AND some data was sent with tx, then tx is
        // of type contract call
        // - If the function identifiers for all erc20 funcs exist in the bytecode
        // then it is an erc20 tx, and we can match the data with the function
        // identifier
      });
    } else {
      txs.forEach(tx => {tx.toContract = false});
    }

    // console.log("transactions: ", txs);

    return txs;
}