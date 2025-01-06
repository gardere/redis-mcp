# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2025-01-06

### Added
- String Commands
  - GET: Retrieve string values
  - SET: Store string values
- Set Commands
  - SADD: Add members to a set
  - SMEMBERS: Get all members of a set
- Sorted Set Commands
  - ZADD: Add members with scores to a sorted set
  - ZRANGE: Get range of members from a sorted set
  - ZRANGEBYSCORE: Get members within a score range
  - ZREM: Remove members from a sorted set

## [0.0.2] - Initial Release
- Hash Commands
  - HGET: Get value of a hash field
  - HGETALL: Get all fields and values in a hash
  - HMSET: Set multiple hash fields to multiple values
- Key Commands
  - DEL: Delete keys
  - SCAN: Iterate over keys matching a pattern