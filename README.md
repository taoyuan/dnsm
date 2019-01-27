# namex

> Manipulate DNS records on various DNS providers(only `gandi` for now) in a standardized/agnostic way for nodejs.

## Installation

```bash
npm i namex -g
```

## Usage

### nxm

```bash
$ nxm -h

   nxm 0.2.1

   USAGE

     nxm <command> [options]

   COMMANDS

     gandi <action> <domain>           Manage DNS records that hosted in gandi
     cloudflare <action> <domain>      Manage DNS records that hosted in cloudflare
     help <command>                    Display help for a specific command

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```

### nxu

```bash
$ nxu -h

   nxu 0.2.1 - Dynamic update domain ip records

   USAGE

     nxu [provider] [domains]

   ARGUMENTS

     [provider]      Specify the dns provider                           optional
     [domains]       Specify the domains to execute, could be list      optional

   OPTIONS

     -t, --type <type>          Specify the entry type                           optional      default: "A"
     -l, --ttl <ttl>            Specify the record time-to-live                  optional      default: 300
     -c, --conf <conf>          Path to the updyn configuration file             optional
     -U, --user <user>          Specify the auth username for some provider      optional
     -P, --pass <pass>          Specify the auth password for some provider      optional
     -T, --token <token>        Specify the auth token for some provider         optional
     -S, --secret <secret>      Specify the auth secret for some provider        optional

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```



## Reference

* [lexicon](https://github.com/AnalogJ/lexicon): Manipulate DNS records on various DNS providers in a standardized way.
* [gandi-dyndns-node](https://github.com/GhyslainBruno/gandi-dyndns-node): Little piece of code in NodeJS to replace dynamically your IP of a Gandi's domain by your actual external IP address (for those who have a dynamic IP and who have some domains at Gandi's company).
