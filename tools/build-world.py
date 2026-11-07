"""Builds public/models/kemen-world.glb, the KEMEN COFFEE coffee house, from nothing but code.

Run headless (it never touches an open Blender session):

  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P tools/build-world.py -- out.glb

Everything is authored Y-up and exported without axis conversion, so coordinates here are the
same numbers the camera path in src/world/path.ts uses. All textures are synthesised below with
spectral noise, which makes them seamless by construction.
"""
import math
import os
import random
import sys
import tempfile
from collections import defaultdict
from contextlib import contextmanager

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

OUT = sys.argv[sys.argv.index('--') + 1]
random.seed(11)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
TEX = 1024
TEMP = tempfile.mkdtemp()


# ---------------------------------------------------------------- textures


def spectral(n, beta, ax=1.0, ay=1.0, seed=0):
    rng = np.random.default_rng(seed)
    fx = np.fft.fftfreq(n)[:, None] * n
    fy = np.fft.fftfreq(n)[None, :] * n
    f = np.sqrt((fx * ay) ** 2 + (fy * ax) ** 2)
    f[0, 0] = 1
    spectrum = f ** (-beta / 2) * np.exp(1j * rng.uniform(0, math.tau, (n, n)))
    spectrum[0, 0] = 0
    out = np.fft.ifft2(spectrum).real
    return (out - out.min()) / (out.max() - out.min())


def normal_map(h, strength):
    dx = np.roll(h, -1, 1) - np.roll(h, 1, 1)
    dy = np.roll(h, -1, 0) - np.roll(h, 1, 0)
    z = np.ones_like(h) / max(strength, 1e-3)
    length = np.sqrt(dx**2 + dy**2 + z**2)
    return np.dstack([-dx / length, dy / length, z / length]) * 0.5 + 0.5


def hex3(value):
    value = value.lstrip('#')
    return np.array([int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)])


def ramp(t, a, b):
    t = np.clip(t, 0, 1)[..., None]
    return a * (1 - t) + b * t


def save(name, array, srgb=True):
    array = np.clip(array, 0, 1)
    if array.ndim == 2:
        array = np.dstack([array] * 3)
    h, w = array.shape[:2]
    image = bpy.data.images.new(name, w, h, alpha=False)
    rgba = np.dstack([array, np.ones((h, w))])[::-1]
    image.pixels.foreach_set(rgba.astype(np.float32).ravel())
    # In-memory images export blank, so each texture goes through a real file first.
    path = os.path.join(TEMP, f'{name}.png')
    image.filepath_raw = path
    image.file_format = 'PNG'
    image.save()
    bpy.data.images.remove(image)
    image = bpy.data.images.load(path)
    image.name = name
    image.colorspace_settings.name = 'sRGB' if srgb else 'Non-Color'
    return image


def wood_height(n, seed, rings=9):
    x = np.linspace(0, 1, n, endpoint=False)[None, :]
    warp = spectral(n, 3.2, 1, 7, seed)
    fine = spectral(n, 1.2, 1, 26, seed + 1)
    wave = 0.5 + 0.5 * np.sin(math.tau * (x * rings + warp * 7))
    return 0.34 * wave + 0.66 * fine, fine


def tex_walnut():
    h, fine = wood_height(TEX, 3)
    save('walnut_color', ramp(h**1.3, hex3('#2b1b12'), hex3('#6a4a33')))
    save('walnut_rough', 0.36 + 0.24 * fine, False)
    save('walnut_normal', normal_map(h, 6), False)


def tex_floor():
    n = TEX
    planks = 6
    h, fine = wood_height(n, 21, rings=26)
    width = n // planks
    height = np.zeros((n, n))
    tint = np.zeros((n, n))
    rng = np.random.default_rng(5)
    for i in range(planks):
        slab = np.roll(h, rng.integers(n), 0)[:, :width]
        height[:, i * width : (i + 1) * width] = slab
        tint[:, i * width : (i + 1) * width] = rng.uniform(0.82, 1.0)
    x = np.arange(n)
    gap = np.minimum(x % width, width - 1 - (x % width)) < 2
    color = ramp(height**1.2, hex3('#3f281a'), hex3('#8a6240')) * tint[..., None]
    color[:, gap] *= 0.25
    height[:, gap] = 0
    save('floor_color', color)
    save('floor_rough', 0.3 + 0.28 * fine, False)
    save('floor_normal', normal_map(height, 5), False)


def tex_terrazzo():
    n = TEX
    rng = np.random.default_rng(9)
    color = np.ones((n, n, 3)) * hex3('#d9cbb6')
    color *= (0.94 + 0.06 * spectral(n, 2, seed=2))[..., None]
    rough = np.full((n, n), 0.24)
    tones = [hex3(c) for c in ('#3b241c', '#6f4e37', '#f5ebdd', '#a4764f', '#1c1c1c', '#efe2cf')]
    for _ in range(1500):
        cx, cy = rng.integers(n, size=2)
        r = rng.uniform(3, 15)
        size = int(r * 2) + 2
        ys, xs = np.mgrid[-size:size, -size:size]
        angle = np.arctan2(ys, xs)
        edge = r * (0.72 + 0.28 * np.sin(angle * rng.integers(2, 5) + rng.uniform(0, 6)))
        mask = xs**2 + ys**2 < edge**2
        color[(ys[mask] + cy) % n, (xs[mask] + cx) % n] = tones[rng.integers(len(tones))]
    save('terrazzo_color', color)
    save('terrazzo_rough', rough, False)


def tex_plaster():
    n = TEX
    h = spectral(n, 2.5, seed=31)
    save('plaster_color', 0.86 + 0.14 * h)
    save('plaster_rough', 0.7 + 0.25 * spectral(n, 1.6, seed=32), False)
    save('plaster_normal', normal_map(h, 2.2), False)


def tex_cloth():
    n = 512
    x = np.linspace(0, math.tau * 90, n, endpoint=False)
    weave = (np.sin(x)[None, :] * np.sin(x)[:, None]) * 0.5 + 0.5
    h = 0.6 * weave + 0.4 * spectral(n, 1, seed=41)
    save('cloth_color', 0.74 + 0.26 * h)
    save('cloth_normal', normal_map(h, 1.6), False)


def tex_leather():
    n = 512
    h = spectral(n, 1.1, seed=51)
    h = np.abs(h - 0.5) * 2
    save('leather_normal', normal_map(h, 3.5), False)


def tex_crema():
    n = 512
    y, x = np.mgrid[1:-1:n * 1j, -1:1:n * 1j]
    warp = spectral(n, 2.6, seed=61) - 0.5
    x2 = x + warp * 0.22
    y2 = y + np.roll(warp, 90, 0) * 0.14
    mottled = 0.72 + 0.5 * (spectral(n, 2.0, seed=62) - 0.5)
    color = ramp(mottled + np.sqrt(x**2 + y**2) * 0.45, hex3('#9c6336'), hex3('#4f2c15'))
    milk = np.zeros((n, n), bool)
    for i, (cy, r) in enumerate([(-0.5, 0.2), (-0.2, 0.32), (0.14, 0.42), (0.46, 0.5)]):
        outer = x2**2 + (y2 - cy) ** 2 < r**2
        inner = x2**2 + (y2 - cy - r * 0.42) ** 2 < (r * 0.86) ** 2
        milk |= outer & ~inner
    milk |= (np.abs(x2) < 0.016) & (y2 > -0.62) & (y2 < 0.8)
    edge = np.exp(-((np.abs(np.sqrt(x**2 + y**2) - 0.97)) / 0.04) ** 2)[..., None]
    color[milk] = hex3('#f7ecdb')
    color = color * (1 - edge * 0.55) + hex3('#c79a63') * edge * 0.55
    save('crema_color', color)


def tex_sky():
    h, w = 512, 1024
    t = np.linspace(0, 1, h)[:, None]
    stops = [(0, '#f6cf8d'), (0.5, '#f0a35d'), (0.78, '#c96a3c'), (1, '#7a3a22')]
    sky = np.zeros((h, w, 3))
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        mask = ((t >= a) & (t <= b))[:, 0]
        sky[mask] = ramp((t[mask] - a) / (b - a) * np.ones((1, w)), hex3(ca), hex3(cb))
    rng = np.random.default_rng(3)
    yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(90):
        cx, cy, r = rng.uniform(0, w), rng.uniform(h * 0.4, h * 1.05), rng.uniform(40, 120)
        blob = np.clip(1.15 - np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r, 0, 1)
        sky *= (1 - blob[..., None] * 0.07)
    for _ in range(70):
        cx, cy, r = rng.uniform(0, w), rng.uniform(0, h * 0.75), rng.uniform(5, 16)
        blob = np.clip(1.4 - np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r, 0, 1)
        sky += blob[..., None] * hex3('#fff0cc') * 0.1
    save('sky_color', sky)


for build in (tex_walnut, tex_floor, tex_terrazzo, tex_plaster, tex_cloth, tex_leather, tex_crema, tex_sky):
    build()


# ---------------------------------------------------------------- materials


def linear(value):
    c = hex3(value)
    return tuple(np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)) + (1.0,)


MATS = {}
TEX_SCALE = {}


def pbr(name, color='#ffffff', rough=0.5, metal=0.0, base=None, rough_map=None, normal=None,
        normal_strength=1.0, emit=None, strength=1.0, scale=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = linear(color)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if base:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images[base]
        links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    if rough_map:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images[rough_map]
        split = nodes.new('ShaderNodeSeparateColor')
        links.new(tex.outputs['Color'], split.inputs[0])
        links.new(split.outputs['Green'], bsdf.inputs['Roughness'])
    if normal:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images[normal]
        map_node = nodes.new('ShaderNodeNormalMap')
        map_node.inputs['Strength'].default_value = normal_strength
        links.new(tex.outputs['Color'], map_node.inputs['Color'])
        links.new(map_node.outputs['Normal'], bsdf.inputs['Normal'])
    if emit:
        bsdf.inputs['Emission Color'].default_value = linear(emit)
        bsdf.inputs['Emission Strength'].default_value = strength
    MATS[name] = mat
    if scale:
        TEX_SCALE[name] = scale
    return name


WALNUT = pbr('walnut', base='walnut_color', rough_map='walnut_rough', normal='walnut_normal', scale=0.7)
FLOOR = pbr('floor', base='floor_color', rough_map='floor_rough', normal='floor_normal', scale=2.4)
TERRAZZO = pbr('terrazzo', base='terrazzo_color', rough_map='terrazzo_rough', scale=0.55)
WALL_WARM = pbr('wall_warm', base='plaster_color', rough_map='plaster_rough', normal='plaster_normal', scale=3)
WALL_DARK = pbr('wall_dark', base='plaster_color', rough_map='plaster_rough', normal='plaster_normal', scale=3)
CEILING = pbr('ceiling', '#2a1b15', rough=0.9)
BRASS = pbr('brass', '#c29a5b', rough=0.26, metal=1)
STEEL = pbr('steel', '#d9d6cf', rough=0.2, metal=1)
BLACK_STEEL = pbr('black_steel', '#1b1816', rough=0.42, metal=0.9)
CERAMIC = pbr('ceramic', '#f3ead9', rough=0.16)
CERAMIC_DARK = pbr('ceramic_dark', '#2a1a14', rough=0.2)
COFFEE = pbr('coffee', '#1f0e07', rough=0.06)
CREMA = pbr('crema', base='crema_color', rough=0.3)
BEAN = pbr('bean', '#3a1e10', rough=0.34)
LEATHER = pbr('leather', '#6e3f22', rough=0.46, normal='leather_normal', normal_strength=0.6, scale=0.3)
CLOTH = pbr('cloth', base='cloth_color', normal='cloth_normal', rough=0.92, scale=0.5)
RUG = pbr('rug', base='cloth_color', normal='cloth_normal', rough=0.95, scale=0.7)
LEAF = pbr('leaf', '#2f4a2c', rough=0.4)
TERRACOTTA = pbr('terracotta', '#a55f3d', rough=0.72)
PAPER = pbr('paper', '#cbb595', rough=0.8)
LAMP = pbr('lamp', '#ffd9a0', emit='#ffc27a', strength=9)
GAUGE = pbr('gauge', '#fff1d8', emit='#ffdca8', strength=2.5)
SKY = pbr('sky', '#000000', base=None, emit='#ffffff', strength=1)
GLASS = pbr('glass', '#ffffff', rough=0.04)
PHOTO = pbr('photo', '#8c7a66', rough=0.5)

sky_nodes = bpy.data.materials['sky'].node_tree
sky_tex = sky_nodes.nodes.new('ShaderNodeTexImage')
sky_tex.image = bpy.data.images['sky_color']
sky_bsdf = next(n for n in sky_nodes.nodes if n.type == 'BSDF_PRINCIPLED')
sky_nodes.links.new(sky_tex.outputs['Color'], sky_bsdf.inputs['Emission Color'])


# ---------------------------------------------------------------- geometry helpers

PARTS = defaultdict(list)
PIVOTS = {}
group_name = ['static']
frame = [Matrix.Identity(4)]
collection = bpy.data.collections.new('world')
scene.collection.children.link(collection)


@contextmanager
def group(name, pivot=(0, 0, 0)):
    group_name.append(name)
    PIVOTS[name] = (frame[-1] @ Matrix.Translation(pivot)).to_translation()
    yield
    group_name.pop()


@contextmanager
def at(loc=(0, 0, 0), rot=0.0):
    frame.append(frame[-1] @ Matrix.Translation(loc) @ Matrix.Rotation(rot, 4, 'Y'))
    yield
    frame.pop()


def finish(mesh, mat, loc=(0, 0, 0), rot=0.0, rot_x=0.0, rot_z=0.0, bevel=0.0, seg=2):
    obj = bpy.data.objects.new(mesh.name, mesh)
    collection.objects.link(obj)
    obj.matrix_world = (
        frame[-1]
        @ Matrix.Translation(loc)
        @ Matrix.Rotation(rot, 4, 'Y')
        @ Matrix.Rotation(rot_x, 4, 'X')
        @ Matrix.Rotation(rot_z, 4, 'Z')
    )
    if bevel:
        mod = obj.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = seg
        mod.limit_method = 'ANGLE'
    PARTS[group_name[-1]].append((obj, mat))
    return obj


def from_data(verts, faces, name='part'):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def box(sx, sy, sz, loc, mat, bevel=0.008, rot=0.0, rot_x=0.0, rot_z=0.0, seg=2):
    x, y, z = sx / 2, sy / 2, sz / 2
    verts = [(a, b, c) for a in (-x, x) for b in (-y, y) for c in (-z, z)]
    faces = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    return finish(from_data(verts, faces, 'box'), mat, loc, rot, rot_x, rot_z, bevel, seg)


def lathe(profile, mat, loc=(0, 0, 0), seg=48, rot_x=0.0, rot_z=0.0, rot=0.0):
    rings = len(profile)
    verts, faces = [], []
    for j, (r, y) in enumerate(profile):
        for i in range(seg):
            a = math.tau * i / seg
            verts.append((r * math.cos(a), y, r * math.sin(a)))
    for j in range(rings - 1):
        for i in range(seg):
            n = (i + 1) % seg
            faces.append((j * seg + i, (j + 1) * seg + i, (j + 1) * seg + n, j * seg + n))
    return finish(from_data(verts, faces, 'lathe'), mat, loc, rot, rot_x, rot_z)


def cyl(r, h, loc, mat, seg=32, rot_x=0.0, rot_z=0.0, rot=0.0):
    return lathe([(0, 0), (r, 0), (r, h), (0, h)], mat, loc, seg, rot_x, rot_z, rot)


def spline(points, steps=8):
    pts = [Vector(p) for p in points]
    pts = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        a, b, c, d = pts[i - 1 : i + 3]
        for k in range(steps):
            t = k / steps
            out.append(
                0.5 * ((2 * b) + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t**2 + (3 * b - a - 3 * c + d) * t**3)
            )
    out.append(pts[-2])
    return out


def tube(points, r, mat, seg=10, loc=(0, 0, 0), rot=0.0, steps=8):
    pts = spline(points, steps) if len(points) > 2 else [Vector(p) for p in points]
    verts, faces = [], []
    up = Vector((0.13, 0.91, 0.39)).normalized()
    for i, p in enumerate(pts):
        d = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        side = d.cross(up).normalized()
        up = side.cross(d).normalized()
        for k in range(seg):
            a = math.tau * k / seg
            verts.append(tuple(p + (side * math.cos(a) + up * math.sin(a)) * r))
    for i in range(len(pts) - 1):
        for k in range(seg):
            n = (k + 1) % seg
            faces.append((i * seg + k, i * seg + n, (i + 1) * seg + n, (i + 1) * seg + k))
    last = (len(pts) - 1) * seg
    faces.append(tuple(range(seg - 1, -1, -1)))
    faces.append(tuple(last + k for k in range(seg)))
    return finish(from_data(verts, faces, 'tube'), mat, loc, rot)


def sign(text, size, loc, mat, rot=0.0, tracking=1.35):
    curve = bpy.data.curves.new('sign', 'FONT')
    curve.body = text
    curve.size = size
    curve.extrude = size * 0.03
    curve.align_x = 'CENTER'
    curve.space_character = tracking
    obj = bpy.data.objects.new('sign', curve)
    collection.objects.link(obj)
    bpy.context.view_layer.update()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(obj)
    return finish(mesh, mat, loc, rot)


def marker(name, loc):
    empty = bpy.data.objects.new(name, None)
    collection.objects.link(empty)
    empty.matrix_world = frame[-1] @ Matrix.Translation(loc)


# ---------------------------------------------------------------- architecture

H = 3.8


def arch_wall(z, x0, x1, openings, mat, t=0.35, height=H, trim=None):
    """A wall across X with arched openings: (centre x, width, crown height, sill height)."""
    cursor = x0
    for cx, w, crown, sill in sorted(openings):
        left, right = cx - w / 2, cx + w / 2
        box(left - cursor, height, t, ((left + cursor) / 2, height / 2, z), mat, 0)
        spring = crown - w / 2
        if sill:
            box(w, sill, t, (cx, sill / 2, z), mat, 0)
        steps = 28
        arc = [(cx - math.cos(math.pi * i / steps) * w / 2, spring + math.sin(math.pi * i / steps) * w / 2)
               for i in range(steps + 1)]
        verts, faces = [], []
        for side in (t / 2, -t / 2):
            for x, y in arc:
                verts += [(x, y, z + side), (x, height, z + side)]
        n = len(arc)
        for i in range(n - 1):
            a, b, c, d = i * 2, i * 2 + 1, (i + 1) * 2, (i + 1) * 2 + 1
            faces.append((a, c, d, b))
            faces.append((a + n * 2, b + n * 2, d + n * 2, c + n * 2))
            faces.append((a, a + n * 2, c + n * 2, c))
        finish(from_data(verts, faces, 'arch'), mat)
        if trim:
            points = [(x, y, z + t / 2 + 0.012) for x, y in arc]
            points = [(left, sill, z + t / 2 + 0.012)] + points + [(right, sill, z + t / 2 + 0.012)]
            tube(points, 0.016, trim, seg=8, steps=1)
        cursor = right
    box(x1 - cursor, height, t, ((x1 + cursor) / 2, height / 2, z), mat, 0)


def wall_x(x, z0, z1, mat):
    box(0.3, H, abs(z1 - z0), (x, H / 2, (z0 + z1) / 2), mat, 0)


# Shell. The four rooms read as one building joined by arches.
box(16, 0.1, 54, (0, -0.05, -18.5), FLOOR, 0)
box(16, 0.1, 54, (0, H + 0.05, -18.5), CEILING, 0)
for x in (-3.15, 3.15):
    wall_x(x, 6, -3, WALL_DARK)
    wall_x(x, -20, -32, WALL_WARM)
for x in (-6.15, 6.15):
    wall_x(x, -3, -20, WALL_WARM)
    wall_x(x, -32, -43, WALL_WARM)
box(6.6, H, 0.3, (0, H / 2, 6.1), WALL_DARK, 0)
for z in (-3, -20, -32):
    arch_wall(z, -6.3, 6.3, [(0, 3.4, 3.15, 0)], WALL_WARM if z != -3 else WALL_DARK, trim=BRASS)
arch_wall(-43, -6.3, 6.3, [(-3.9, 2.5, 3.2, 0.55), (0, 2.9, 3.4, 0.55), (3.9, 2.5, 3.2, 0.55)], WALL_WARM, trim=BRASS)
box(16, 7, 0.1, (0, 3.2, -45.5), SKY, 0)

# Ceiling beams give the flight a sense of speed.
for z in np.arange(-4.5, -20, -2.4):
    box(12.2, 0.22, 0.2, (0, H - 0.11, float(z)), WALNUT, 0.006)
for z in np.arange(-33.5, -43, -2.4):
    box(12.2, 0.22, 0.2, (0, H - 0.11, float(z)), WALNUT, 0.006)
for z in np.arange(-21, -32, -1.5):
    box(6.2, 0.1, 0.1, (0, H - 0.05, float(z)), BLACK_STEEL, 0.004)
for x in (-1.3, 1.3):
    box(0.05, 0.05, 11.6, (x, H - 0.14, -26), BLACK_STEEL, 0)

# Foyer: dark walnut slats around the hero cup.
for side in (-1, 1):
    for z in np.arange(-2.8, 6, 0.12):
        box(0.05, 3.3, 0.075, (side * 2.97, 1.65, float(z)), WALNUT, 0)
for x in np.arange(-2.9, 3, 0.12):
    box(0.075, 3.3, 0.05, (float(x), 1.65, 5.92), WALNUT, 0)
box(1.5, 1.0, 0.8, (0, 0.5, 0), TERRAZZO, 0.012)
box(1.66, 0.045, 0.96, (0, 1.0225, 0), WALNUT, 0.01)
sign('KEMEN', 0.18, (0, 3.32, -2.8), BRASS)


# ---------------------------------------------------------------- objects


def cup_parts(body=CERAMIC, surface=CREMA, saucer=True):
    profile = [(0, 0), (0.027, 0), (0.03, 0.002), (0.034, 0.008), (0.042, 0.026), (0.047, 0.046),
               (0.049, 0.06), (0.0495, 0.0635), (0.0475, 0.0645), (0.0465, 0.06), (0.044, 0.044),
               (0.036, 0.022), (0.02, 0.009), (0, 0.007)]
    lathe(profile, body, seg=48)
    lathe([(0, 0), (0.0456, 0), (0.0462, 0.0008), (0, 0.0008)], surface, (0, 0.0528, 0), seg=40)
    tube([(0.046, 0.05, 0), (0.07, 0.056, 0), (0.077, 0.038, 0), (0.062, 0.02, 0), (0.038, 0.016, 0)],
         0.0048, body, seg=10)
    if saucer:
        lathe([(0, 0), (0.038, 0), (0.044, 0.002), (0.07, 0.011), (0.078, 0.0145), (0.0775, 0.0162),
               (0.07, 0.0135), (0.044, 0.006), (0, 0.005)], body, (0, -0.005, 0), seg=48)


def table(x, z, h=0.74, r=0.42):
    with at((x, 0, z)):
        lathe([(0, 0), (0.24, 0), (0.25, 0.012), (0.09, 0.03), (0.035, 0.06), (0.03, 0.4), (0.04, h - 0.04),
               (0.09, h - 0.02), (0, h - 0.02)], BLACK_STEEL, seg=32)
        lathe([(0, h - 0.03), (r - 0.012, h - 0.03), (r, h - 0.022), (r, h - 0.008), (r - 0.008, h), (0, h)],
              WALNUT, seg=48)


def chair(x, z, rot):
    with at((x, 0, z), rot):
        lathe([(0, 0.44), (0.19, 0.44), (0.205, 0.452), (0.2, 0.47), (0.15, 0.482), (0, 0.484)], WALNUT, seg=24)
        for a, b in ((-1, 1), (1, 1), (-1, -1), (1, -1)):
            tube([(a * 0.13, 0.45, b * 0.13), (a * 0.2, 0, b * 0.2)], 0.012, BLACK_STEEL, seg=8)
        tube([(-0.15, 0.46, -0.13), (-0.18, 0.72, -0.18), (0, 0.84, -0.22), (0.18, 0.72, -0.18), (0.15, 0.46, -0.13)],
             0.011, BLACK_STEEL, seg=8, steps=10)
        box(0.36, 0.1, 0.02, (0, 0.74, -0.21), WALNUT, 0.006)


def plant(name, x, z, scale=1.0):
    with at((x, 0, z)):
        lathe([(0, 0), (0.17 * scale, 0), (0.22 * scale, 0.42 * scale), (0.2 * scale, 0.42 * scale),
               (0.19 * scale, 0.38 * scale), (0, 0.38 * scale)], TERRACOTTA, seg=28)
        with group(name, (0, 0.38 * scale, 0)):
            for i in range(14):
                a = i * 2.4
                length = random.uniform(0.75, 1.25) * scale
                rise = random.uniform(0.6, 1.25) * scale
                reach = random.uniform(0.28, 0.7) * scale
                tip = (math.cos(a) * reach, 0.38 * scale + rise, math.sin(a) * reach)
                mid = (tip[0] * 0.3, 0.38 * scale + rise * 0.72, tip[2] * 0.3)
                tube([(0, 0.38 * scale, 0), mid, tip], 0.006, LEAF, seg=5, steps=5)
                leaf_w = length * 0.2
                verts, faces = [], []
                d = Vector((math.cos(a), -0.42, math.sin(a))).normalized()
                side = Vector((-math.sin(a), 0, math.cos(a)))
                n = 7
                for k in range(n):
                    t = k / (n - 1)
                    w = math.sin(t * math.pi) ** 0.7 * leaf_w
                    centre = Vector(tip) + d * (t * length * 0.6) + Vector((0, -0.25 * t**2 * length, 0))
                    dip = Vector((0, -w * 0.25, 0))
                    verts += [tuple(centre - side * w + dip), tuple(centre), tuple(centre + side * w + dip)]
                for k in range(n - 1):
                    i0 = k * 3
                    faces += [(i0, i0 + 3, i0 + 4, i0 + 1), (i0 + 1, i0 + 4, i0 + 5, i0 + 2)]
                leaf = finish(from_data(verts, faces, 'leaf'), LEAF)
                leaf.data.shade_smooth()


def pendant(name, x, z, drop=1.55, r=0.2):
    with group(name, (x, H, z)):
        with at((x, H, z)):
            cyl(0.03, 0.03, (0, -0.03, 0), BLACK_STEEL, seg=16)
            cyl(0.0035, drop, (0, -drop, 0), BLACK_STEEL, seg=6)
            lathe([(0.018, -drop - 0.0), (0.03, -drop - 0.03), (r * 0.5, -drop - 0.075), (r * 0.86, -drop - 0.16),
                   (r, -drop - 0.26), (r * 0.98, -drop - 0.262), (r * 0.82, -drop - 0.16), (r * 0.45, -drop - 0.09),
                   (0, -drop - 0.07)], BRASS, seg=40)
            lathe([(0, -drop - 0.2), (0.035, -drop - 0.17), (0.055, -drop - 0.13), (0, -drop - 0.09)],
                  LAMP, seg=20, rot_x=0)


def coffee_bag(x, y, z, rot, tone):
    with at((x, y, z), rot):
        box(0.15, 0.25, 0.08, (0, 0.125, 0), tone, 0.016, seg=3)
        box(0.09, 0.09, 0.002, (0, 0.13, 0.041), PAPER, 0)
        box(0.15, 0.02, 0.05, (0, 0.26, 0), tone, 0.008)


def jar(x, y, z):
    with at((x, y, z)):
        lathe([(0, 0), (0.055, 0), (0.06, 0.012), (0.06, 0.13), (0.045, 0.15), (0.045, 0.17), (0, 0.17)],
              GLASS, seg=24)
        lathe([(0, 0), (0.05, 0), (0.05, 0.02), (0, 0.022)], WALNUT, (0, 0.165, 0), seg=24)
        lathe([(0, 0), (0.054, 0), (0.054, 0.09), (0, 0.095)], BEAN, (0, 0.012, 0), seg=20)


# Hero cup on the foyer slab.
with group('hero_cup', (0, 1.05, 0)):
    with at((0, 1.05, 0)):
        cup_parts()
        marker('marker_steam_hero', (0, 0.07, 0))
        tube([(0.09, 0.004, 0.035), (0.12, 0.007, 0.05), (0.15, 0.006, 0.066), (0.21, 0.004, 0.09)],
             0.0032, BRASS, seg=8)

# Beans scattered on the slab.
for i in range(32):
    a, r = random.uniform(0, math.tau), random.uniform(0.17, 0.46)
    marker(f'marker_bean_{i}', (math.cos(a) * r * 1.4, 1.058, math.sin(a) * r * 0.75))

# One bean, instanced by the code for the swarm and everything on the plinths.
bean_verts, bean_faces = [], []
rows, cols = 9, 14
for j in range(rows):
    v = j / (rows - 1) * math.pi
    for i in range(cols):
        u = i / cols * math.tau
        x, y, z = math.sin(v) * math.cos(u), math.cos(v), math.sin(v) * math.sin(u)
        px, py, pz = x * 0.0065, y * 0.0048, z * 0.0095
        if y > 0:
            py = py * 0.55 - 0.0024 * math.exp(-((x + math.sin(z * 2.6) * 0.34) / 0.2) ** 2) * (1 - abs(z) ** 2)
        bean_verts.append((px, py, pz))
for j in range(rows - 1):
    for i in range(cols):
        n = (i + 1) % cols
        bean_faces.append((j * cols + i, (j + 1) * cols + i, (j + 1) * cols + n, j * cols + n))
with group('bean'):
    finish(from_data(bean_verts, bean_faces, 'bean'), BEAN).data.shade_smooth()

# Main cafe seating.
for name, tx, tz in (('a', -3.6, -6.0), ('b', -3.4, -9.4), ('c', -4.2, -12.8), ('d', -1.2, -14.8), ('e', 1.4, -6.2)):
    table(tx, tz)
    for k in range(2):
        a = k * math.pi + 0.5
        chair(tx + math.cos(a) * 0.68, tz + math.sin(a) * 0.68, -a - math.pi / 2)
    with at((tx + 0.1, 0.745, tz + 0.08)):
        cup_parts(CERAMIC if name != 'c' else CERAMIC_DARK)
for i, (tx, tz) in enumerate(((-3.5, -9.32), (1.5, -6.12), (-3.5, -5.92))):
    marker(f'marker_steam_cafe_{i}', (tx, 0.82, tz))

# Wall banquette and shelving on the seating side.
box(0.6, 0.42, 9.6, (-5.68, 0.21, -9.4), WALNUT, 0.012)
for z in np.arange(-5, -14.5, -0.98):
    box(0.56, 0.14, 0.94, (-5.66, 0.49, float(z)), LEATHER, 0.03, seg=3)
    box(0.14, 0.62, 0.94, (-5.92, 0.88, float(z)), LEATHER, 0.04, seg=3)
for y in (1.72, 2.2):
    box(0.26, 0.04, 6.4, (-5.87, y, -9.2), WALNUT, 0.006)
for z in np.arange(-6.3, -12.4, -0.34):
    z = float(z)
    if random.random() < 0.55:
        coffee_bag(-5.86, 1.74, z, 1.57 + random.uniform(-0.12, 0.12), random.choice((LEATHER, CERAMIC_DARK, TERRACOTTA)))
    else:
        jar(-5.86, 1.74, z)
    if random.random() < 0.7:
        jar(-5.86, 2.22, z + 0.1)
plant('plant_a', -5.2, -3.9, 1.2)
plant('plant_b', 5.3, -4.2, 1.5)
plant('plant_c', -5.3, -18.6, 1.3)
plant('plant_d', 2.5, -30.8, 1.0)
plant('plant_e', 5.3, -33.4, 1.5)
plant('plant_f', -5.3, -41.6, 1.3)
for i, (px, pz) in enumerate(((-3.6, -6), (-3.4, -9.4), (-4.2, -12.8), (-1.2, -14.8), (1.4, -6.2))):
    pendant(f'pendant_{i}', px, pz)

# Espresso bar with fluted front.
BAR_X, BAR_Z0, BAR_Z1 = 3.75, -9.2, -19.0
box(0.9, 1.04, abs(BAR_Z1 - BAR_Z0), (BAR_X + 0.46, 0.52, (BAR_Z0 + BAR_Z1) / 2), WALL_DARK, 0.004)
box(1.06, 0.05, abs(BAR_Z1 - BAR_Z0) + 0.14, (BAR_X + 0.46, 1.085, (BAR_Z0 + BAR_Z1) / 2), TERRAZZO, 0.008)
for z in np.arange(BAR_Z0 - 0.05, BAR_Z1, -0.076):
    lathe([(0, 0.08), (0.036, 0.08), (0.036, 1.04), (0, 1.04)], WALNUT, (BAR_X, 0, float(z)), seg=8)
box(0.1, 0.08, abs(BAR_Z1 - BAR_Z0), (BAR_X + 0.02, 0.04, (BAR_Z0 + BAR_Z1) / 2), BRASS, 0.004)
for z in (-10.2, -11.6, -13.0, -17.8):
    with at((3.05, 0, z)):
        lathe([(0, 0), (0.2, 0), (0.205, 0.015), (0.03, 0.04), (0.025, 0.68), (0, 0.68)], BLACK_STEEL, seg=24)
        lathe([(0, 0.68), (0.17, 0.68), (0.18, 0.72), (0.15, 0.75), (0, 0.76)], LEATHER, seg=24)
        lathe([(0.15, 0.24), (0.165, 0.24), (0.165, 0.255), (0.15, 0.255)], BRASS, seg=24)
for y in (1.6, 2.1, 2.6):
    box(0.34, 0.05, 8.6, (5.82, y, -14.2), WALNUT, 0.008)
for y in (1.62, 2.12, 2.62):
    for z in np.arange(-10.2, -18.4, -0.36):
        z = float(z)
        pick = random.random()
        if pick < 0.42:
            with at((5.82, y + 0.006, z)):
                cup_parts(random.choice((CERAMIC, CERAMIC, CERAMIC_DARK)), COFFEE, saucer=False)
        elif pick < 0.75:
            jar(5.82, y, z)
        else:
            coffee_bag(5.82, y, z, -1.57, random.choice((LEATHER, CERAMIC_DARK)))
box(0.04, 1.6, 8.8, (5.98, 2.2, -14.2), WALNUT, 0)

# The KEMEN K-1 espresso machine, an original two-group design. Front faces the customer (-X).
with at((4.34, 1.11, -14.6), -math.pi / 2):
    box(0.96, 0.05, 0.58, (0, 0.025, 0), STEEL, 0.012)
    for x in np.arange(-0.4, 0.42, 0.04):
        box(0.018, 0.012, 0.2, (float(x), 0.056, 0.17), BLACK_STEEL, 0.002)
    box(0.96, 0.25, 0.36, (0, 0.205, -0.1), CERAMIC_DARK, 0.03, seg=4)
    box(0.9, 0.27, 0.3, (0, 0.41, -0.05), STEEL, 0.045, seg=4)
    box(0.74, 0.17, 0.02, (0, 0.415, 0.106), BLACK_STEEL, 0.006)
    box(0.96, 0.03, 0.42, (0, 0.555, -0.06), BRASS, 0.01)
    for x in (-0.46, 0.46):
        cyl(0.02, 0.36, (x, 0.05, 0.26), BRASS, seg=16)
    box(0.96, 0.02, 0.02, (0, 0.415, 0.26), BRASS, 0.004)
    for x in np.arange(-0.4, 0.42, 0.16):
        with at((float(x), 0.57, -0.06)):
            lathe([(0.03, 0), (0.05, 0), (0.05, 0.055), (0.03, 0.055)], CERAMIC, seg=20)
    for i, x in enumerate((-0.2, 0.2)):
        with at((x, 0, 0.1)):
            lathe([(0, 0.26), (0.05, 0.26), (0.06, 0.29), (0.06, 0.36), (0, 0.38)], STEEL, (0, 0, 0), seg=28)
            lathe([(0, 0), (0.046, 0), (0.05, 0.03), (0.05, 0.05), (0, 0.05)], STEEL, (0, 0.212, 0.0), seg=28)
            tube([(0, 0.228, 0.04), (0, 0.222, 0.16), (0, 0.214, 0.21)], 0.013, WALNUT, seg=12)
            lathe([(0, 0), (0.0165, 0), (0.0165, 0.012), (0, 0.012)], BRASS, (0, 0.205, 0.21), rot_x=1.57, seg=14)
            for side in (-1, 1):
                tube([(0, 0.21, 0), (side * 0.017, 0.2, 0), (side * 0.02, 0.183, 0)], 0.0045, STEEL, seg=8)
    for x in (-0.1, 0.1, 0.0):
        cyl(0.012, 0.016, (x, 0.415, 0.114), BRASS, seg=14, rot_x=1.57)
    for x in (-0.31, 0.31):
        cyl(0.044, 0.012, (x, 0.415, 0.112), BRASS, seg=28, rot_x=1.57)
        cyl(0.037, 0.003, (x, 0.415, 0.124), GAUGE, seg=28, rot_x=1.57)
    tube([(-0.43, 0.32, 0.08), (-0.45, 0.26, 0.14), (-0.46, 0.17, 0.18), (-0.47, 0.09, 0.2)], 0.0052, STEEL, seg=8)
    tube([(0.43, 0.32, 0.08), (0.45, 0.26, 0.14), (0.45, 0.12, 0.17)], 0.0052, STEEL, seg=8)
    sign('KEMEN', 0.034, (0, 0.462, 0.118), BRASS, tracking=1.4)
    marker('marker_pour', (-0.2, 0.183, 0.1))
    marker('marker_brew_cup', (-0.2, 0.0625, 0.1))
    with group('brew_cup', (-0.2, 0.0625, 0.1)):
        with at((-0.2, 0.0625, 0.1)):
            lathe([(0, 0), (0.024, 0), (0.03, 0.006), (0.038, 0.03), (0.041, 0.056), (0.039, 0.058), (0.036, 0.03),
                   (0.028, 0.01), (0, 0.007)], CERAMIC, seg=32)
            tube([(0.039, 0.044, 0), (0.056, 0.046, 0), (0.06, 0.03, 0), (0.05, 0.018, 0), (0.033, 0.016, 0)],
                 0.0036, CERAMIC, seg=8)

# Grinder beside the machine.
with at((4.3, 1.11, -13.7)):
    box(0.16, 0.34, 0.2, (0, 0.17, 0), CERAMIC_DARK, 0.03, seg=3)
    lathe([(0.04, 0.34), (0.095, 0.5), (0.1, 0.5), (0.1, 0.51), (0, 0.515)], GLASS, seg=24)
    lathe([(0, 0.34), (0.04, 0.34), (0.086, 0.47), (0, 0.47)], BEAN, seg=20)

# Turntable for inspecting a drink.
with at((3.95, 1.11, -16.5)):
    lathe([(0, 0), (0.19, 0), (0.2, 0.01), (0.19, 0.02), (0, 0.02)], WALNUT, seg=48)
    lathe([(0.19, 0.012), (0.2, 0.012), (0.2, 0.018), (0.19, 0.018)], BRASS, seg=48)
    marker('marker_turntable', (0, 0.022, 0))

with group('product_cup'):
    cup_parts()
with group('product_glass'):
    lathe([(0, 0), (0.04, 0), (0.042, 0.006), (0.052, 0.17), (0.0505, 0.17), (0.0405, 0.012), (0, 0.01)],
          GLASS, seg=40)
    tube([(0.012, 0.03, 0), (0.03, 0.2, 0.012), (0.06, 0.23, 0.02)], 0.0032, BLACK_STEEL, seg=8)


# Gallery wing: slots on both walls, plinths down the middle.
slots = []
for i, z in enumerate((-22.2, -24.2, -26.2, -28.2, -30.2)):
    for side in (-1, 1):
        with at((side * 2.97, 1.56, z), -side * math.pi / 2):
            portrait = (i + (side > 0)) % 2 == 0
            w, h = (0.98, 1.24) if portrait else (1.4, 1.02)
            box(w + 0.09, h + 0.09, 0.05, (0, 0, 0.025), BLACK_STEEL, 0.006)
            box(w + 0.02, h + 0.02, 0.012, (0, 0, 0.051), CERAMIC, 0.001)
            with group(f'gallery_slot_{len(slots)}'):
                mesh = from_data([(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)],
                                 [(0, 1, 2, 3)], 'photo')
                uv = mesh.uv_layers.new(name='UVMap')
                for loop, value in zip(uv.data, ((0, 0), (1, 0), (1, 1), (0, 1))):
                    loop.uv = value
                finish(mesh, PHOTO, (0, 0, 0.06))
            slots.append((w, h))

plinths = [(-0.9, -23.2), (0.95, -25.2), (-0.9, -27.2), (0.95, -29.2)]
for px, pz in plinths:
    box(0.54, 1.0, 0.54, (px, 0.5, pz), TERRAZZO, 0.006)
    box(0.58, 0.03, 0.58, (px, 1.015, pz), BRASS, 0.004)
# Pour-over dripper and server.
with at((plinths[0][0], 1.03, plinths[0][1])):
    lathe([(0, 0), (0.06, 0), (0.078, 0.03), (0.08, 0.14), (0.05, 0.19), (0.05, 0.2), (0.046, 0.2), (0.046, 0.19),
           (0.074, 0.14), (0, 0.13)], GLASS, seg=36)
    tube([(0.078, 0.14, 0), (0.12, 0.13, 0), (0.12, 0.07, 0), (0.078, 0.05, 0)], 0.006, GLASS, seg=8)
    lathe([(0, 0.11), (0.074, 0.11), (0.06, 0.145), (0, 0.15)], BEAN, seg=24)
    lathe([(0.05, 0.2), (0.09, 0.2), (0.09, 0.21), (0.05, 0.21)], BRASS, seg=32)
    lathe([(0.012, 0.21), (0.09, 0.3), (0.086, 0.3), (0.01, 0.22)], CERAMIC, seg=32)
# A stack of cups.
with at((plinths[2][0], 1.03, plinths[2][1])):
    for k in range(4):
        with at((0.002 * k, 0.04 * k + 0.005, 0), rot=k * 1.2):
            cup_parts(CERAMIC if k % 2 else CERAMIC_DARK, COFFEE, saucer=False)
# Stove-top brewer, faceted.
with at((plinths[1][0], 1.03, plinths[1][1])):
    lathe([(0, 0), (0.085, 0), (0.06, 0.1), (0.052, 0.11), (0.052, 0.12), (0.07, 0.13), (0.084, 0.25), (0.06, 0.26),
           (0.02, 0.29), (0, 0.3)], STEEL, seg=8)
    tube([(0.075, 0.22, 0), (0.15, 0.22, 0), (0.17, 0.12, 0)], 0.01, BLACK_STEEL, seg=8)
# Fourth plinth holds the bean sculpture, which the swarm forms in code.
marker('marker_sculpture', (plinths[3][0], 1.42, plinths[3][1]))

# Lounge.
box(9.6, 0.42, 0.8, (0, 0.21, -42.3), WALNUT, 0.012)
for x in np.arange(-4.2, 4.3, 1.2):
    box(1.14, 0.16, 0.74, (float(x), 0.5, -42.26), CLOTH, 0.05, seg=3)
    box(1.14, 0.56, 0.2, (float(x), 0.88, -42.56), CLOTH, 0.06, seg=3)
lathe([(0, 0), (2.5, 0), (2.5, 0.012), (0, 0.012)], RUG, (0.2, 0, -38.8), seg=64)
for k, (ax, az, rot) in enumerate(((-1.6, -38.4, 1.25), (1.9, -38.2, -1.3))):
    with at((ax, 0, az), rot):
        box(0.74, 0.14, 0.7, (0, 0.34, 0), LEATHER, 0.05, seg=3)
        box(0.74, 0.54, 0.16, (0, 0.62, -0.32), LEATHER, 0.06, seg=3)
        for side in (-1, 1):
            box(0.11, 0.3, 0.68, (side * 0.38, 0.47, 0), LEATHER, 0.045, seg=3)
            tube([(side * 0.32, 0.27, 0.28), (side * 0.36, 0, 0.32)], 0.012, BRASS, seg=8)
            tube([(side * 0.32, 0.27, -0.28), (side * 0.36, 0, -0.32)], 0.012, BRASS, seg=8)
with at((0.2, 0, -38.8)):
    lathe([(0, 0), (0.28, 0), (0.29, 0.01), (0.05, 0.03), (0.04, 0.34), (0, 0.34)], BRASS, seg=32)
    lathe([(0, 0.34), (0.56, 0.34), (0.58, 0.355), (0.56, 0.38), (0, 0.38)], TERRAZZO, seg=56)
    for dx, dz, name in ((0.2, 0.12, 'a'), (-0.22, -0.1, 'b')):
        with at((dx, 0.388, dz)):
            cup_parts()
        marker(f'marker_steam_lounge_{name}', (dx, 0.458, dz))
with at((-4.6, 0, -37.2)):
    lathe([(0, 0), (0.17, 0), (0.17, 0.02), (0.012, 0.03), (0.012, 1.65), (0, 1.65)], BLACK_STEEL, seg=20)
    tube([(0, 1.65, 0), (0.14, 1.78, 0), (0.34, 1.74, 0)], 0.01, BLACK_STEEL, seg=8)
    with at((0.34, 1.72, 0)):
        lathe([(0.03, 0.04), (0.19, -0.11), (0.185, -0.113), (0, -0.05)], BRASS, seg=28)
        lathe([(0, 0), (0.05, -0.03), (0, -0.08)], LAMP, seg=16)
for y in (0.9, 1.4, 1.9, 2.4):
    box(0.3, 0.04, 3.2, (5.84, y, -36.6), WALNUT, 0.006)
    for z in np.arange(-35.2, -38, -0.5):
        if random.random() < 0.75:
            coffee_bag(5.84, y + 0.02, float(z), -1.57, random.choice((LEATHER, CERAMIC_DARK, TERRACOTTA)))
for i, (px, pz) in enumerate(((0.2, -38.8), (-3.6, -40.8), (3.8, -40.6))):
    pendant(f'pendant_lounge_{i}', px, pz, drop=1.75, r=0.26)


# ---------------------------------------------------------------- bake to one mesh per material


def box_uvs(bm, tile):
    layer = bm.loops.layers.uv.verify()
    for face in bm.faces:
        n = face.normal
        dominant = max(range(3), key=lambda i: abs(n[i]))
        for loop in face.loops:
            co = loop.vert.co
            if dominant == 1:
                loop[layer].uv = (co.x / tile, co.z / tile)
            elif dominant == 0:
                loop[layer].uv = (co.z / tile, co.y / tile)
            else:
                loop[layer].uv = (co.x / tile, co.y / tile)


def bake_group(name, parts):
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    pivot = PIVOTS.get(name, Vector((0, 0, 0)))
    offset = Matrix.Translation(-pivot)
    by_mat = defaultdict(list)
    for obj, mat in parts:
        by_mat[mat].append(obj)
    owner = None
    if name != 'static':
        owner = bpy.data.objects.new(name, None)
        collection.objects.link(owner)
        owner.matrix_world = Matrix.Translation(pivot)
    for mat, objs in by_mat.items():
        bm = bmesh.new()
        for obj in objs:
            temp = bpy.data.meshes.new_from_object(obj.evaluated_get(graph))
            temp.transform(offset @ obj.matrix_world)
            bm.from_mesh(temp)
            bpy.data.meshes.remove(temp)
        bm.normal_update()
        has_uv = bool(bm.loops.layers.uv)
        if mat in TEX_SCALE:
            box_uvs(bm, TEX_SCALE[mat])
        elif mat == 'sky':
            layer = bm.loops.layers.uv.verify()
            for face in bm.faces:
                for loop in face.loops:
                    loop[layer].uv = ((loop.vert.co.x + 7) / 14, (loop.vert.co.y + 0.1) / 4.2)
        elif not has_uv and mat in ('crema',):
            layer = bm.loops.layers.uv.verify()
            for face in bm.faces:
                for loop in face.loops:
                    loop[layer].uv = (loop.vert.co.x / 0.0925 + 0.5, loop.vert.co.z / 0.0925 + 0.5)
        mesh = bpy.data.meshes.new(f'{name}__{mat}')
        bm.to_mesh(mesh)
        bm.free()
        mesh.materials.append(MATS[mat])
        mesh.shade_smooth()
        mesh.set_sharp_from_angle(angle=math.radians(52))
        baked = bpy.data.objects.new(f'{name}__{mat}', mesh)
        collection.objects.link(baked)
        if owner:
            baked.parent = owner
            baked.matrix_parent_inverse = Matrix.Identity(4)
    for obj, _ in parts:
        bpy.data.objects.remove(obj)


for name in list(PARTS):
    bake_group(name, PARTS[name])

bpy.context.view_layer.update()
triangles = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in scene.objects if o.type == 'MESH')
print(f'WORLD objects={len(scene.objects)} meshes={sum(o.type == "MESH" for o in scene.objects)} tris={triangles}')

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format='GLB',
    export_yup=False,
    export_apply=False,
    export_image_format='WEBP',
    export_cameras=False,
    export_lights=False,
    export_animations=False,
)
print('WORLD exported', OUT)
