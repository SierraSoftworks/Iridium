import {BuildUrl} from "../lib/utils/UrlBuilder";
import {Configuration} from "../lib/Configuration";
import * as chai from "chai";

describe("UrlBuilder", () => {
    describe("Single host", () => {
        const tests: {
            name: string;
            config: Configuration;
            expectedUrl: string;
        }[] = [
            {
                name: "only the host",
                config: {
                    host: "test_host"
                },
                expectedUrl: "mongodb://test_host"
            },
            {
                name: "with a database name",
                config: {
                    host: "test_host",
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://test_host/iridium_test"
            },
            {
                name: "with a port",
                config: {
                    host: "test_host",
                    port: 27016
                },
                expectedUrl: "mongodb://test_host:27016"
            },
            {
                name: "with a port and database name",
                config: {
                    host: "test_host",
                    port: 27016,
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://test_host:27016/iridium_test"
            },
            {
                name: "with a username",
                config: {
                    host: "test_host",
                    username: "user"
                },
                expectedUrl: "mongodb://user@test_host"
            },
            {
                name: "with a username and password",
                config: {
                    host: "test_host",
                    username: "user",
                    password: "password"
                },
                expectedUrl: "mongodb://user:password@test_host"
            },
            {
                name: "with a username and database",
                config: {
                    host: "test_host",
                    username: "user",
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://user@test_host/iridium_test"
            },
            {
                name: "with a username, password and database",
                config: {
                    host: "test_host",
                    username: "user",
                    password: "password",
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://user:password@test_host/iridium_test"
            },
            {
                name: "with all the extras",
                config: {
                    host: "test_host",
                    username: "user",
                    password: "password",
                    database: "iridium_test",
                    port: 27016
                },
                expectedUrl: "mongodb://user:password@test_host:27016/iridium_test"
            }
        ];

        tests.forEach(test => {
            describe(test.name, () => {
                it("should not throw an error", () => {
                    chai.expect(() => BuildUrl(test.config)).to.not.throw;
                });

                it("should return a string", () => {
                    chai.expect(BuildUrl(test.config)).to.exist.and.be.a("string");
                });

                it("should match the expected URL", () => {
                    chai.expect(BuildUrl(test.config)).to.eql(test.expectedUrl);
                });
            });
        });
    });

    describe("Multiple hosts", () => {
        const tests: {
            name: string;
            config: Configuration;
            expectedUrl: string;
        }[] = [
            {
                name: "only the hosts",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ]
                },
                expectedUrl: "mongodb://host1,host2,host3"
            },
            {
                name: "with a database name",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://host1,host2,host3/iridium_test"
            },
            {
                name: "with a port",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    port: 27016
                },
                expectedUrl: "mongodb://host1:27016,host2:27016,host3:27016"
            },
            {
                name: "with a custom host port",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3",
                            port: 27015
                        }
                    ],
                    port: 27016
                },
                expectedUrl: "mongodb://host1:27016,host2:27016,host3:27015"
            },
            {
                name: "with a port and database name",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    port: 27016,
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://host1:27016,host2:27016,host3:27016/iridium_test"
            },
            {
                name: "with a username",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    username: "user"
                },
                expectedUrl: "mongodb://user@host1,host2,host3"
            },
            {
                name: "with a username and password",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    username: "user",
                    password: "password"
                },
                expectedUrl: "mongodb://user:password@host1,host2,host3"
            },
            {
                name: "with a username and database",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    username: "user",
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://user@host1,host2,host3/iridium_test"
            },
            {
                name: "with a username, password and database",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    username: "user",
                    password: "password",
                    database: "iridium_test"
                },
                expectedUrl: "mongodb://user:password@host1,host2,host3/iridium_test"
            },
            {
                name: "with all the extras",
                config: {
                    hosts: [
                        {
                            address: "host1"
                        },
                        {
                            address: "host2"
                        },
                        {
                            address: "host3"
                        }
                    ],
                    username: "user",
                    password: "password",
                    database: "iridium_test",
                    port: 27016
                },
                expectedUrl: "mongodb://user:password@host1:27016,host2:27016,host3:27016/iridium_test"
            }
        ];

        tests.forEach(test => {
            describe(test.name, () => {
                it("should not throw an error", () => {
                    chai.expect(() => BuildUrl(test.config)).to.not.throw;
                });

                it("should return a string", () => {
                    chai.expect(BuildUrl(test.config)).to.exist.and.be.a("string");
                });

                it("should match the expected URL", () => {
                    chai.expect(BuildUrl(test.config)).to.eql(test.expectedUrl);
                });
            });
        });
    });
});