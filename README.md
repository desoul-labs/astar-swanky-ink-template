# astar-swanky-ink-template

![GitHub License](https://img.shields.io/github/license/desoul-labs/astar-swanky-ink-template)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdesoul-labs%2Fastar-swanky-ink-template.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdesoul-labs%2Fastar-swanky-ink-template?ref=badge_shield)

This is a template for building smart contracts on [Astar Network](https://astar.network/) using the [Swanky Suite](https://docs.astar.network/docs/build/wasm/swanky/) and [Ink! eDSL](https://use.ink/). It uses [OpenBrush](https://openbrush.io/) libraries for reusable smart contract components.

## Getting Started

1. Clone this repository

2. Install dependencies

```bash
pnpm install
```

3. Compile contracts

```bash
pnpm compile psp34
```

4. Run tests

```bash
pnpm node

pnpm test psp34
```

5. Deploy contracts

```bash
pnpm node

pnpm run deploy psp34 --account=alice --gas=2000000000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdesoul-labs%2Fastar-swanky-ink-template.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdesoul-labs%2Fastar-swanky-ink-template?ref=badge_large)