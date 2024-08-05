const anchor = require('@project-serum/anchor');

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  const idl = JSON.parse(
    require('fs').readFileSync('./target/idl/solana_itus.json', 'utf8')
  );

  const programId = new anchor.web3.PublicKey('FWnGsp5dSMW91H8ap8zc4BPjqfTN4yMg9PYxedw3mZGy'); // Replace with your actual program ID

  const program = new anchor.Program(idl, programId, provider);

  const state = anchor.web3.Keypair.generate();
  const bottomToken = anchor.web3.Keypair.generate();
  const topToken = anchor.web3.Keypair.generate();
  const lpBottomTop = anchor.web3.Keypair.generate();
  const lpBottomSol = anchor.web3.Keypair.generate();
  const lpTopSol = anchor.web3.Keypair.generate();
  const mintAuthority = anchor.web3.Keypair.generate();

  await program.rpc.initialize(new anchor.BN(60), new anchor.BN(1000), {
    accounts: {
      state: state.publicKey,
      bottomToken: bottomToken.publicKey,
      topToken: topToken.publicKey,
      mintAuthority: mintAuthority.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [state, mintAuthority],
  });

  await program.rpc.initializeTokens({
    accounts: {
      bottomToken: bottomToken.publicKey,
      topToken: topToken.publicKey,
      mintAuthority: mintAuthority.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.web3.TokenInstructions.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [bottomToken, topToken],
  });

  await program.rpc.initializePools({
    accounts: {
      bottomToken: bottomToken.publicKey,
      topToken: topToken.publicKey,
      lpBottomTop: lpBottomTop.publicKey,
      lpBottomSol: lpBottomSol.publicKey,
      lpTopSol: lpTopSol.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.web3.TokenInstructions.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [lpBottomTop, lpBottomSol, lpTopSol],
  });

  console.log('State account:', state.publicKey.toString());
  console.log('Bottom token mint:', bottomToken.publicKey.toString());
  console.log('Top token mint:', topToken.publicKey.toString());
  console.log('LP bottom/top:', lpBottomTop.publicKey.toString());
  console.log('LP bottom/sol:', lpBottomSol.publicKey.toString());
  console.log('LP top/sol:', lpTopSol.publicKey.toString());
};
