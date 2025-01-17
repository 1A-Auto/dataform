package(default_visibility = ["//visibility:public"])

EXCLUDE_PATTERNS = [
    ".next/**",
    "out/**",
]

load("//tools:css_typings.bzl", "css_typings")

filegroup(
    name = "css",
    srcs = glob(["**/*.css"]),
)

css_typings(
    name = "css_typings",
    srcs = [":css"],
)

load("//tools:next_site.bzl", "next_site")

next_site(
    name = "docs",
    srcs = glob(
        ["**/*.*"],
        exclude = EXCLUDE_PATTERNS,
    ),
    data = [
        ":css_typings",
        "//:package.json",
        "//:tsconfig.json",
        "//fe:css",
        "//static:files",
        "@npm//@blueprintjs/core",
        "@npm//@blueprintjs/select",
        "@npm//@mapbox/rehype-prism",
        "@npm//@zeit/next-css",
        "@npm//@zeit/next-mdx",
        "@npm//@zeit/next-typescript",
        "@npm//algoliasearch",
        "@npm//css-loader",
        "@npm//extracted-loader",
        "@npm//next-images",
        "@npm//next-server",
        "@npm//react-instantsearch-dom",
        "@npm//react-is",
        "@npm//react-media",
        "@npm//remark",
        "@npm//remark-react",
        "@npm//remark-slug",
        "@npm//tsconfig-paths-webpack-plugin",
        "@npm//umd-compat-loader",
        "@npm//url-loader",
    ],
    port = 3001,
    site_path = "docs",
)

load("@io_bazel_rules_docker//container:container.bzl", "container_image")

container_image(
    name = "image",
    base = "//tools/nginx/static",
    directory = "/usr/share/nginx/html",
    tars = [":docs_pkg"],
)

load("@io_bazel_rules_docker//container:container.bzl", "container_push")

container_push(
    name = "push",
    format = "Docker",
    image = ":image",
    registry = "gcr.io",
    repository = "tada-analytics/static-docs",
    tag = "latest",
)
